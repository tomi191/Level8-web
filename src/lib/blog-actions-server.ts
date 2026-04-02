/**
 * Service-role blog action helpers for cron/API routes.
 *
 * Unlike blog-actions.ts (which is "use server" and uses cookie-based auth),
 * these functions use SUPABASE_SERVICE_ROLE_KEY and skip revalidatePath() calls.
 * Suitable for cron jobs, webhooks, and other non-interactive server contexts.
 */

import { createClient } from "@supabase/supabase-js";
import { getContentEngine } from "@/lib/content-engine/create-engine";
import { generateBlogPost as generateBlogPostAI } from "@/lib/content-engine/ai/blog-generator";
import { generateAndUploadImage } from "@/lib/content-engine/ai/image-generator";
import { complete } from "@/lib/content-engine/ai/openrouter-client";
import { postLinkToFacebookPage } from "@/lib/content-engine/social/facebook";
import { postImageToInstagram } from "@/lib/content-engine/social/instagram";
import { sendToViberChannel } from "@/lib/content-engine/social/viber";
import { sendToTelegramChannel } from "@/lib/content-engine/social/telegram";
import type { ContentType } from "@/lib/content-engine/types";
import type { Database } from "@/types/database";

// ============ SERVICE CLIENT ============

let _serviceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getServiceClient() {
  if (_serviceClient) return _serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _serviceClient = createClient<Database>(url, key);
  return _serviceClient;
}

// ============ GENERATE & SAVE DRAFT ============

export async function generateAndSaveDraft(params: {
  topic: string;
  keywords: string[];
  contentType: ContentType;
  category: string;
  targetWordCount: number;
  extraContext?: string;
  useWebSearch?: boolean;
  model?: string;
}): Promise<{ id: string; title: string; slug: string; wordCount: number }> {
  const engine = getContentEngine();
  const config = params.model
    ? { ...engine, defaultTextModel: params.model }
    : engine;

  // Web research (if enabled and configured)
  let enrichedContext = params.extraContext || "";
  if (params.useWebSearch && config.webSearch) {
    const { searchWeb, formatSearchContext } = await import(
      "@/lib/content-engine/research/web-search"
    );
    const searchResult = await searchWeb(
      config.webSearch,
      params.topic,
      params.keywords
    );
    enrichedContext =
      formatSearchContext(searchResult) +
      (enrichedContext ? "\n\n" + enrichedContext : "");
  }

  const result = await generateBlogPostAI(config, {
    topic: params.topic,
    keywords: params.keywords,
    contentType: params.contentType,
    category: params.category,
    targetWordCount: params.targetWordCount,
    extraContext: enrichedContext || undefined,
  });

  // Save to DB as draft via service client
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: result.title,
      slug: result.suggestedSlug,
      content: result.content,
      excerpt: result.excerpt,
      published: false,
      content_type: params.contentType,
      category: params.category,
      meta_title: result.metaTitle,
      meta_description: result.metaDescription,
      keywords: result.keywords,
      read_time: result.readingTime,
      word_count: result.wordCount,
      ai_model: config.defaultTextModel,
      ai_generated: true,
      author: { name: "Level 8", avatar: "/logo.svg" },
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to save blog post: ${error.message}`);

  return {
    id: data.id,
    title: result.title,
    slug: result.suggestedSlug,
    wordCount: result.wordCount,
  };
}

// ============ IMAGE GENERATION ============

/**
 * Extract text around each H2 section for image prompt context.
 * Returns: [heroContext, section1Context, section2Context]
 */
function extractSectionContexts(
  title: string,
  html: string
): [string, string, string] {
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const h2Matches = [...html.matchAll(h2Regex)];

  // Hero context = title + first paragraph
  const firstParagraph = html.match(/<p[^>]*>(.*?)<\/p>/i)?.[1] || "";
  const heroCtx = `${title}. ${firstParagraph.replace(/<[^>]+>/g, "").substring(0, 300)}`;

  // Section 1 = first H2 heading + content until next H2
  let section1Ctx = title;
  if (h2Matches[0]) {
    const heading = h2Matches[0][1].replace(/<[^>]+>/g, "");
    const startIdx = h2Matches[0].index! + h2Matches[0][0].length;
    const endIdx = h2Matches[1]?.index ?? startIdx + 500;
    const sectionText = html
      .substring(startIdx, endIdx)
      .replace(/<[^>]+>/g, "")
      .substring(0, 300);
    section1Ctx = `${heading}. ${sectionText}`;
  }

  // Section 2 = second H2 heading + content until next H2
  let section2Ctx = title;
  if (h2Matches[1]) {
    const heading = h2Matches[1][1].replace(/<[^>]+>/g, "");
    const startIdx = h2Matches[1].index! + h2Matches[1][0].length;
    const endIdx = h2Matches[2]?.index ?? startIdx + 500;
    const sectionText = html
      .substring(startIdx, endIdx)
      .replace(/<[^>]+>/g, "")
      .substring(0, 300);
    section2Ctx = `${heading}. ${sectionText}`;
  }

  return [heroCtx, section1Ctx, section2Ctx];
}

async function generateImagePrompt(
  engine: ReturnType<typeof getContentEngine>,
  sectionContext: string,
  role: string
): Promise<string> {
  const result = await complete(engine, {
    messages: [
      {
        role: "system",
        content:
          "You are an image prompt generator for a tech blog. Given a blog section context, generate a concise image prompt (1-2 sentences) for a professional illustration. Style: modern, clean, dark background with subtle neon green accents, tech/digital aesthetic. The image should visually represent the topic. Output ONLY the image prompt in English, nothing else.",
      },
      {
        role: "user",
        content: `Generate an image prompt for the ${role} of a blog article.\n\nSection context: ${sectionContext}`,
      },
    ],
    temperature: 0.8,
    maxTokens: 150,
  });
  return result.content.trim();
}

export async function generateImagesForPost(postId: string) {
  const engine = getContentEngine();

  // 1. Fetch post content
  const supabase = getServiceClient();
  const { data: post, error: fetchError } = await supabase
    .from("blog_posts")
    .select("title, content")
    .eq("id", postId)
    .single();

  if (fetchError || !post?.content) throw new Error("Post content not found");

  // 2. Extract section contexts
  const [heroCtx, section1Ctx, section2Ctx] = extractSectionContexts(
    post.title,
    post.content
  );

  // 3. Generate 3 image prompts in parallel
  const [heroPrompt, img1Prompt, img2Prompt] = await Promise.all([
    generateImagePrompt(engine, heroCtx, "hero/featured image"),
    generateImagePrompt(engine, section1Ctx, "first illustration"),
    generateImagePrompt(engine, section2Ctx, "second illustration"),
  ]);

  engine.logger?.info("Generated image prompts", {
    heroPrompt,
    img1Prompt,
    img2Prompt,
  });

  // 4. Generate 3 images in parallel
  const timestamp = Date.now();
  const [heroUrl, img1Url, img2Url] = await Promise.all([
    generateAndUploadImage(
      engine,
      heroPrompt,
      `posts/${postId}/hero-${timestamp}.webp`,
      "blog-assets"
    ),
    generateAndUploadImage(
      engine,
      img1Prompt,
      `posts/${postId}/img1-${timestamp}.webp`,
      "blog-assets"
    ),
    generateAndUploadImage(
      engine,
      img2Prompt,
      `posts/${postId}/img2-${timestamp}.webp`,
      "blog-assets"
    ),
  ]);

  // 5. Replace placeholders in content
  let updatedContent = post.content;
  updatedContent = updatedContent.replace("<!-- HERO_IMAGE -->", "");
  updatedContent = updatedContent.replace(
    "<!-- IMAGE:1 -->",
    `<img src="${img1Url}" alt="" class="w-full rounded-xl my-6" />`
  );
  updatedContent = updatedContent.replace(
    "<!-- IMAGE:2 -->",
    `<img src="${img2Url}" alt="" class="w-full rounded-xl my-6" />`
  );

  // 6. Update DB
  const { error } = await supabase
    .from("blog_posts")
    .update({
      image: heroUrl,
      content: updatedContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) throw new Error(`Failed to update images: ${error.message}`);

  return { heroUrl, img1Url, img2Url, updatedContent };
}

// ============ PUBLISH POST ============

export async function publishPost(postId: string) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) throw new Error(`Failed to publish: ${error.message}`);
}

// ============ NOTIFY ON PUBLISH (SERVER) ============

/**
 * Fire-and-forget social notifications — same logic as notifyOnPublish()
 * in blog-actions.ts but using service client for cron/API context.
 */
export async function notifyOnPublishServer(postId: string) {
  const supabase = getServiceClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, image, keywords")
    .eq("id", postId)
    .single();

  if (!post) return;

  const postUrl = `https://level8.bg/blog/${post.slug}`;
  const engine = getContentEngine();

  // 1. Facebook Page post
  if (engine.facebook) {
    try {
      console.log("[Facebook] Posting for:", postId);
      const hashtags = Array.isArray(post.keywords)
        ? (post.keywords as string[])
            .slice(0, 5)
            .map((kw) => `#${kw.replace(/\s+/g, "")}`)
            .join(" ")
        : "";
      const message =
        `${post.title}\n\n${post.excerpt || ""}\n\n${hashtags}`.trim();
      const result = await postLinkToFacebookPage(engine, {
        link: postUrl,
        message,
      });
      if (!result.success) {
        console.error("[Facebook] Failed:", result.error);
      } else {
        console.log("[Facebook] Posted!", result.postId);
      }
    } catch (err) {
      console.error("[Facebook] Error:", err);
    }
  }

  // 2. Instagram image post (only if image exists)
  if (engine.instagram && post.image) {
    try {
      console.log("[Instagram] Posting for:", postId);
      const hashtags = Array.isArray(post.keywords)
        ? (post.keywords as string[])
            .slice(0, 15)
            .map((kw) => `#${kw.replace(/\s+/g, "")}`)
            .join(" ")
        : "";
      const caption =
        `${post.title}\n\n${post.excerpt || ""}\n\n\u{1F449} \u041F\u0440\u043E\u0447\u0435\u0442\u0438 \u043F\u043E\u0432\u0435\u0447\u0435: ${postUrl}\n\n${hashtags}`.trim();
      const igResult = await postImageToInstagram(engine, {
        imageUrl: post.image,
        caption,
      });
      if (!igResult.success) {
        console.error("[Instagram] Failed:", igResult.error);
      } else {
        console.log("[Instagram] Posted!", igResult.mediaId);
      }
    } catch (err) {
      console.error("[Instagram] Error:", err);
    }
  }

  // 3. Viber channel notification
  if (engine.viber) {
    try {
      console.log("[Viber] Sending for:", postId);
      const result = await sendToViberChannel(engine.viber, {
        title: post.title,
        url: postUrl,
        imageUrl: post.image || undefined,
        excerpt: post.excerpt || undefined,
      });
      if (!result.success) {
        console.error("[Viber] Failed:", result.error);
      } else {
        console.log("[Viber] Sent!");
      }
    } catch (err) {
      console.error("[Viber] Error:", err);
    }
  }

  // 4. Telegram channel notification
  if (engine.telegram) {
    try {
      console.log("[Telegram] Sending for:", postId);
      const tgResult = await sendToTelegramChannel(engine, {
        title: post.title,
        url: postUrl,
        imageUrl: post.image || undefined,
        excerpt: post.excerpt || undefined,
      });
      if (!tgResult.success) {
        console.error("[Telegram] Failed:", tgResult.error);
      } else {
        console.log("[Telegram] Sent!", tgResult.messageId);
      }
    } catch (err) {
      console.error("[Telegram] Error:", err);
    }
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContentEngine } from "@/lib/content-engine/create-engine";
import { generateBlogPost as generateBlogPostAI } from "@/lib/content-engine/ai/blog-generator";
import { generateAndUploadImage } from "@/lib/content-engine/ai/image-generator";
import { complete } from "@/lib/content-engine/ai/openrouter-client";
import { generateGoogleTTS } from "@/lib/content-engine/audio/google-tts";
import { generateElevenLabsTTS } from "@/lib/content-engine/audio/elevenlabs-tts";
import { stripHtmlForTTS } from "@/lib/content-engine/audio/audio-utils";
import { generateFullVideo } from "@/lib/content-engine/video/video-generator";
import { uploadToAll } from "@/lib/content-engine/social/upload-orchestrator";
import type { ContentType } from "@/lib/content-engine/types";
import type { Json, Database } from "@/types/database";

// Lazy-init service role client (bypasses RLS for public actions)
let _serviceClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;
function getServiceSupabase() {
  if (!_serviceClient && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    _serviceClient = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _serviceClient;
}

// ============ BLOG GENERATION ============

export async function generateBlogPost(params: {
  topic: string;
  keywords: string[];
  contentType: ContentType;
  category: string;
  targetWordCount: number;
  extraContext?: string;
  useWebSearch?: boolean;
  model?: string;
}) {
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

  // Save to DB immediately as draft
  const supabase = await createClient();
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

  revalidatePath("/admin/blog");
  return { id: data.id, ...result };
}

// ============ CRUD ============

export async function saveBlogPost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    content?: string | null;
    excerpt?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    category?: string;
    keywords?: string[];
    content_type?: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ ...data, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq("id", id);

  if (error) throw new Error(`Failed to save: ${error.message}`);

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

export async function publishBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to publish: ${error.message}`);

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");

  // Fire-and-forget notifications (don't block the publish)
  notifyOnPublish(id).catch((err) =>
    console.error("[Notify] Failed:", err)
  );
}

export async function unpublishBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to unpublish: ${error.message}`);

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) throw new Error(`Failed to delete: ${error.message}`);

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

// ============ IMAGE GENERATION ============

export async function generateFeaturedImage(postId: string, prompt: string) {
  const engine = getContentEngine();
  const timestamp = Date.now();
  const storagePath = `posts/${postId}/featured-${timestamp}.webp`;

  const url = await generateAndUploadImage(
    engine,
    prompt,
    storagePath,
    "blog-assets"
  );

  // Update post
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ image: url, updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) throw new Error(`Failed to update featured image: ${error.message}`);

  revalidatePath(`/admin/blog/${postId}`);
  return url;
}

// ============ BLOG IMAGES (AUTO) ============

/**
 * Extract text around each H2 section for image prompt context.
 * Returns: [heroContext, section1Context, section2Context]
 */
function extractSectionContexts(title: string, html: string): [string, string, string] {
  // Split by H2 tags
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
    const sectionText = html.substring(startIdx, endIdx).replace(/<[^>]+>/g, "").substring(0, 300);
    section1Ctx = `${heading}. ${sectionText}`;
  }

  // Section 2 = second H2 heading + content until next H2
  let section2Ctx = title;
  if (h2Matches[1]) {
    const heading = h2Matches[1][1].replace(/<[^>]+>/g, "");
    const startIdx = h2Matches[1].index! + h2Matches[1][0].length;
    const endIdx = h2Matches[2]?.index ?? startIdx + 500;
    const sectionText = html.substring(startIdx, endIdx).replace(/<[^>]+>/g, "").substring(0, 300);
    section2Ctx = `${heading}. ${sectionText}`;
  }

  return [heroCtx, section1Ctx, section2Ctx];
}

async function generateImagePrompt(engine: ReturnType<typeof getContentEngine>, sectionContext: string, role: string): Promise<string> {
  const result = await complete(engine, {
    messages: [
      {
        role: "system",
        content: `You are an image prompt generator for a tech blog. Given a blog section context, generate a concise image prompt (1-2 sentences) for a professional illustration. Style: modern, clean, dark background with subtle neon green accents, tech/digital aesthetic. The image should visually represent the topic. Output ONLY the image prompt in English, nothing else.`,
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

export async function generateBlogImages(postId: string) {
  const engine = getContentEngine();

  // 1. Fetch post content
  const supabase = await createClient();
  const { data: post, error: fetchError } = await supabase
    .from("blog_posts")
    .select("title, content")
    .eq("id", postId)
    .single();

  if (fetchError || !post?.content) throw new Error("Post content not found");

  // 2. Extract section contexts
  const [heroCtx, section1Ctx, section2Ctx] = extractSectionContexts(post.title, post.content);

  // 3. Generate 3 image prompts in parallel
  const [heroPrompt, img1Prompt, img2Prompt] = await Promise.all([
    generateImagePrompt(engine, heroCtx, "hero/featured image"),
    generateImagePrompt(engine, section1Ctx, "first illustration"),
    generateImagePrompt(engine, section2Ctx, "second illustration"),
  ]);

  engine.logger?.info("Generated image prompts", { heroPrompt, img1Prompt, img2Prompt });

  // 4. Generate 3 images in parallel
  const timestamp = Date.now();
  const [heroUrl, img1Url, img2Url] = await Promise.all([
    generateAndUploadImage(engine, heroPrompt, `posts/${postId}/hero-${timestamp}.webp`, "blog-assets"),
    generateAndUploadImage(engine, img1Prompt, `posts/${postId}/img1-${timestamp}.webp`, "blog-assets"),
    generateAndUploadImage(engine, img2Prompt, `posts/${postId}/img2-${timestamp}.webp`, "blog-assets"),
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

  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/blog");

  // 7. Auto-post to Instagram if article is already published
  //    (Instagram requires an image, so we post after image generation)
  const { data: publishedPost } = await supabase
    .from("blog_posts")
    .select("published, title, slug, excerpt, keywords")
    .eq("id", postId)
    .single();

  if (publishedPost?.published) {
    const imgEngine = getContentEngine();
    if (imgEngine.instagram && heroUrl) {
      try {
        console.log("[Instagram] Auto-posting after image generation for:", postId);
        const { postImageToInstagram } = await import("@/lib/content-engine/social/instagram");
        const postUrl = `https://level8.bg/blog/${publishedPost.slug}`;
        const hashtags = Array.isArray(publishedPost.keywords)
          ? (publishedPost.keywords as string[]).slice(0, 15).map((kw) => `#${kw.replace(/\s+/g, "")}`).join(" ")
          : "";
        const caption = `${publishedPost.title}\n\n${publishedPost.excerpt || ""}\n\n\u{1F449} \u041F\u0440\u043E\u0447\u0435\u0442\u0438 \u043F\u043E\u0432\u0435\u0447\u0435: ${postUrl}\n\n${hashtags}`.trim();
        const igResult = await postImageToInstagram(imgEngine, {
          imageUrl: heroUrl,
          caption,
        });
        if (!igResult.success) {
          console.error("[Instagram] \u274C FAILED to auto-post after images:", igResult.error);
        } else {
          console.log("[Instagram] \u2705 Auto-posted after image generation!", igResult.mediaId);
        }
      } catch (err) {
        console.error("[Instagram] \u274C Auto-post error:", err);
      }
    }
  }

  return { heroUrl, img1Url, img2Url, updatedContent };
}

// ============ AUDIO GENERATION ============

export async function generateAudio(
  postId: string,
  provider: "google" | "elevenlabs"
) {
  const engine = getContentEngine();

  // Get post content
  const supabase = await createClient();
  const { data: post, error: fetchError } = await supabase
    .from("blog_posts")
    .select("content, title")
    .eq("id", postId)
    .single();

  if (fetchError || !post?.content)
    throw new Error("Post content not found");

  let audioBuffer: Buffer;
  let contentType: string;

  if (provider === "google") {
    const result = await generateGoogleTTS(engine, post.content, "bg-BG-female");
    audioBuffer = result.buffer;
    contentType = result.contentType;
  } else {
    const plainText = stripHtmlForTTS(post.content);
    const result = await generateElevenLabsTTS(engine, plainText);
    audioBuffer = Buffer.from(result.base64, "base64");
    contentType = result.contentType;
  }

  // Upload to Supabase Storage
  const timestamp = Date.now();
  const ext = contentType === "audio/mpeg" ? "mp3" : "wav";
  const storagePath = `posts/${postId}/audio-${timestamp}.${ext}`;

  if (!engine.storage) throw new Error("Storage not configured");
  const url = await engine.storage.upload(
    "blog-assets",
    storagePath,
    audioBuffer,
    contentType
  );

  // Estimate duration (avg 150 words per minute for Bulgarian)
  const plainText = stripHtmlForTTS(post.content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const durationSec = Math.round((wordCount / 150) * 60);

  // Note: audio_url/audio_duration_sec columns not in current schema
  // Audio is returned but not persisted to DB until schema is extended

  revalidatePath(`/admin/blog/${postId}`);
  return { url, durationSec };
}

// ============ VIDEO GENERATION ============

export async function generateVideo(postId: string, topic: string) {
  const engine = getContentEngine();

  const { script, video } = await generateFullVideo(engine, topic, {
    language: "Bulgarian",
    maxWords: 45,
  });

  // Note: video_url/video_task_id columns not in current schema
  // Video is returned but not persisted to DB until schema is extended

  revalidatePath(`/admin/blog/${postId}`);
  return { videoUrl: video.videoUrl, script: script.script };
}

// ============ SOCIAL PUBLISHING ============

export async function publishToSocial(
  postId: string,
  platforms: string[]
) {
  const engine = getContentEngine();

  // Get post data
  const supabase = await createClient();
  const { data: post, error: fetchError } = await supabase
    .from("blog_posts")
    .select("title, excerpt, keywords")
    .eq("id", postId)
    .single();

  if (fetchError || !post)
    throw new Error("Post not found");

  // Note: video_url/social_posts columns not in current schema
  // Social publishing requires schema extension
  throw new Error("Social publishing requires video_url and social_posts columns in the database schema");
}

// ============ BLOG SUBSCRIPTION ============

export async function subscribeToBlog(email: string): Promise<{ error?: string }> {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u0438\u043C\u0435\u0439\u043B \u0430\u0434\u0440\u0435\u0441." };
  }

  const supabase = getServiceSupabase();
  if (!supabase) return { error: "\u0421\u044A\u0440\u0432\u044A\u0440\u043D\u0430 \u0433\u0440\u0435\u0448\u043A\u0430." };

  // Upsert — re-activate if previously unsubscribed
  const { error } = await supabase
    .from("blog_subscribers")
    .upsert(
      {
        email,
        status: "active",
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    );

  if (error) {
    console.error("[Subscribe] Error:", error.message);
    return { error: "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0430\u0431\u043E\u043D\u0430\u043C\u0435\u043D\u0442\u0430." };
  }

  return {};
}

// ============ VIBER CHANNEL ============

export async function sendToViber(postId: string) {
  const engine = getContentEngine();
  if (!engine.viber) {
    console.error("[Viber] ❌ Viber not configured (env vars missing?)");
    throw new Error("Viber not configured");
  }

  console.log("[Viber] Manual send triggered for post:", postId);

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, image")
    .eq("id", postId)
    .single();

  if (error || !post) {
    console.error("[Viber] ❌ Post not found:", postId, error);
    throw new Error("Post not found");
  }

  console.log("[Viber] Sending to channel:", post.title);

  const { sendToViberChannel } = await import("@/lib/content-engine/social/viber");
  const result = await sendToViberChannel(engine.viber, {
    title: post.title,
    url: `https://level8.bg/blog/${post.slug}`,
    imageUrl: post.image || undefined,
    excerpt: post.excerpt || undefined,
  });

  if (!result.success) {
    console.error("[Viber] ❌ Send failed:", result.error);
    throw new Error(result.error || "Viber send failed");
  }

  console.log("[Viber] ✅ Manual send successful!");
  return result;
}

// ============ FACEBOOK PAGE ============

export async function sendToFacebook(postId: string) {
  const engine = getContentEngine();
  if (!engine.facebook) {
    console.error("[Facebook] \u274C Facebook not configured (env vars missing?)");
    throw new Error("Facebook not configured. Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN.");
  }

  console.log("[Facebook] Manual send triggered for post:", postId);

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, keywords")
    .eq("id", postId)
    .single();

  if (error || !post) {
    console.error("[Facebook] \u274C Post not found:", postId, error);
    throw new Error("Post not found");
  }

  const postUrl = `https://level8.bg/blog/${post.slug}`;
  const hashtags = Array.isArray(post.keywords)
    ? (post.keywords as string[]).slice(0, 5).map((kw) => `#${kw.replace(/\s+/g, "")}`).join(" ")
    : "";
  const message = `${post.title}\n\n${post.excerpt || ""}\n\n${hashtags}\n\n\u{1F449} ${postUrl}`.trim();

  const { postLinkToFacebookPage } = await import("@/lib/content-engine/social/facebook");
  const result = await postLinkToFacebookPage(engine, {
    link: postUrl,
    message,
  });

  if (!result.success) {
    console.error("[Facebook] \u274C Send failed:", result.error);
    throw new Error(result.error || "Facebook post failed");
  }

  console.log("[Facebook] \u2705 Post published!", result.postId);
  return result;
}

// ============ INSTAGRAM ============

export async function sendToInstagram(postId: string) {
  const engine = getContentEngine();
  if (!engine.instagram) {
    console.error("[Instagram] \u274C Instagram not configured (env vars missing?)");
    throw new Error("Instagram not configured. Set INSTAGRAM_ACCOUNT_ID and FACEBOOK_PAGE_ACCESS_TOKEN.");
  }

  console.log("[Instagram] Manual send triggered for post:", postId);

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, image, keywords")
    .eq("id", postId)
    .single();

  if (error || !post) {
    console.error("[Instagram] \u274C Post not found:", postId, error);
    throw new Error("Post not found");
  }

  if (!post.image) {
    throw new Error("Post has no featured image. Instagram requires an image.");
  }

  const postUrl = `https://level8.bg/blog/${post.slug}`;
  const hashtags = Array.isArray(post.keywords)
    ? (post.keywords as string[]).slice(0, 15).map((kw) => `#${kw.replace(/\s+/g, "")}`).join(" ")
    : "";
  const caption = `${post.title}\n\n${post.excerpt || ""}\n\n\u{1F449} \u041F\u0440\u043E\u0447\u0435\u0442\u0438 \u043F\u043E\u0432\u0435\u0447\u0435: ${postUrl}\n\n${hashtags}`.trim();

  const { postImageToInstagram } = await import("@/lib/content-engine/social/instagram");
  const result = await postImageToInstagram(engine, {
    imageUrl: post.image,
    caption,
  });

  if (!result.success) {
    console.error("[Instagram] \u274C Send failed:", result.error);
    throw new Error(result.error || "Instagram post failed");
  }

  console.log("[Instagram] \u2705 Post published!", result.mediaId);
  return result;
}

// ============ NOTIFY ON PUBLISH ============

async function notifyOnPublish(postId: string) {
  const supabase = getServiceSupabase();
  if (!supabase) return;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, image, keywords")
    .eq("id", postId)
    .single();

  if (!post) return;

  const postUrl = `https://level8.bg/blog/${post.slug}`;

  // 1. Facebook Page post
  const engine = getContentEngine();
  if (engine.facebook) {
    try {
      console.log("[Facebook] Attempting to post to page for post:", postId);
      const { postLinkToFacebookPage } = await import("@/lib/content-engine/social/facebook");
      const hashtags = Array.isArray(post.keywords)
        ? (post.keywords as string[]).slice(0, 5).map((kw) => `#${kw.replace(/\s+/g, "")}`).join(" ")
        : "";
      const message = `${post.title}\n\n${post.excerpt || ""}\n\n${hashtags}`.trim();
      const result = await postLinkToFacebookPage(engine, {
        link: postUrl,
        message,
      });
      if (!result.success) {
        console.error("[Facebook] \u274C FAILED to post:", result.error);
      } else {
        console.log("[Facebook] \u2705 Successfully posted!", result.postId);
      }
    } catch (err) {
      console.error("[Facebook] \u274C Post error:", err);
    }
  } else {
    console.warn("[Facebook] \u26A0\uFE0F Facebook not configured (env vars missing?)");
  }

  // 2. Instagram image post
  if (engine.instagram && post.image) {
    try {
      console.log("[Instagram] Attempting to post for:", postId);
      const { postImageToInstagram } = await import("@/lib/content-engine/social/instagram");
      const hashtags = Array.isArray(post.keywords)
        ? (post.keywords as string[]).slice(0, 15).map((kw) => `#${kw.replace(/\s+/g, "")}`).join(" ")
        : "";
      const caption = `${post.title}\n\n${post.excerpt || ""}\n\n\u{1F449} \u041F\u0440\u043E\u0447\u0435\u0442\u0438 \u043F\u043E\u0432\u0435\u0447\u0435: ${postUrl}\n\n${hashtags}`.trim();
      const igResult = await postImageToInstagram(engine, {
        imageUrl: post.image,
        caption,
      });
      if (!igResult.success) {
        console.error("[Instagram] \u274C FAILED to post:", igResult.error);
      } else {
        console.log("[Instagram] \u2705 Successfully posted!", igResult.mediaId);
      }
    } catch (err) {
      console.error("[Instagram] \u274C Post error:", err);
    }
  } else if (!engine.instagram) {
    console.warn("[Instagram] \u26A0\uFE0F Instagram not configured (env vars missing?)");
  }

  // 3. Viber channel notification
  if (engine.viber) {
    try {
      console.log("[Viber] Attempting to notify channel for post:", postId);
      const { sendToViberChannel } = await import("@/lib/content-engine/social/viber");
      const result = await sendToViberChannel(engine.viber, {
        title: post.title,
        url: postUrl,
        imageUrl: post.image || undefined,
        excerpt: post.excerpt || undefined,
      });
      if (!result.success) {
        console.error("[Viber] ❌ FAILED to notify channel:", result.error);
      } else {
        console.log("[Viber] ✅ Successfully notified channel!");
      }
    } catch (err) {
      console.error("[Viber] ❌ Notify error:", err);
    }
  } else {
    console.warn("[Viber] ⚠️ Viber not configured (env vars missing?)");
  }

  // 4. Push notifications
  try {
    await sendPushToAll(
      post.title,
      post.excerpt || "\u041D\u043E\u0432\u0430 \u0441\u0442\u0430\u0442\u0438\u044F \u0432 \u0431\u043B\u043E\u0433\u0430 \u043D\u0430 \u041B\u0415\u0412\u0415\u041B 8",
      postUrl
    );
  } catch (err) {
    console.error("[Push] Notify error:", err);
  }

  // 5. Email notification to subscribers
  try {
    const { data: subscribers } = await supabase
      .from("blog_subscribers")
      .select("email")
      .eq("status", "active");

    if (subscribers && subscribers.length > 0) {
      const { SignJWT } = await import("jose");
      const secret = new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET || "level8-unsubscribe-secret");

      // Lazy-init Resend
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      for (const sub of subscribers) {
        const unsubToken = await new SignJWT({ email: sub.email })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("365d")
          .sign(secret);

        const unsubUrl = `https://level8.bg/blog/unsubscribe?token=${unsubToken}`;

        await resend.emails.send({
          from: "Level 8 \u0411\u043B\u043E\u0433 <noreply@level8.bg>",
          to: sub.email,
          subject: `\u041D\u043E\u0432\u0430 \u0441\u0442\u0430\u0442\u0438\u044F: ${post.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:32px;border-radius:16px;">
              <p style="font-size:12px;color:#39FF14;font-family:monospace;letter-spacing:0.1em;">// \u041D\u041E\u0412\u0410 \u0421\u0422\u0410\u0422\u0418\u042F</p>
              <h1 style="font-size:22px;color:#ffffff;margin:12px 0;">${escapeHtml(post.title)}</h1>
              ${post.excerpt ? `<p style="color:#aaa;font-size:15px;line-height:1.6;">${escapeHtml(post.excerpt)}</p>` : ""}
              <a href="${postUrl}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#39FF14;color:#0a0a0a;font-weight:bold;text-decoration:none;border-radius:8px;">\u041F\u0440\u043E\u0447\u0435\u0442\u0438 \u0441\u0442\u0430\u0442\u0438\u044F\u0442\u0430</a>
              <p style="margin-top:32px;font-size:11px;color:#666;">
                <a href="${unsubUrl}" style="color:#666;text-decoration:underline;">\u041E\u0442\u043F\u0438\u0448\u0438 \u0441\u0435</a>
              </p>
            </div>
          `,
        }).catch((err: unknown) => console.error("[Email] Send error:", err));
      }
    }
  } catch (err) {
    console.error("[Email] Notify error:", err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============ SUBSCRIBER MANAGEMENT ============

export async function getSubscriberStats() {
  const supabase = await createClient();

  const [emailTotal, emailActive, emailUnsub, pushTotal] = await Promise.all([
    supabase.from("blog_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("blog_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("blog_subscribers").select("id", { count: "exact", head: true }).eq("status", "unsubscribed"),
    supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalEmail: emailTotal.count ?? 0,
    activeEmail: emailActive.count ?? 0,
    unsubscribedEmail: emailUnsub.count ?? 0,
    totalPush: pushTotal.count ?? 0,
  };
}

export async function getEmailSubscribers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch subscribers: ${error.message}`);
  return data ?? [];
}

export async function getPushSubscribers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch push subscribers: ${error.message}`);
  return data ?? [];
}

export async function deleteEmailSubscriber(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_subscribers").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete: ${error.message}`);
  revalidatePath("/admin/subscribers");
}

export async function toggleEmailSubscriber(id: string) {
  const supabase = await createClient();
  const { data: sub, error: fetchError } = await supabase
    .from("blog_subscribers")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !sub) throw new Error("Subscriber not found");

  const newStatus = sub.status === "active" ? "unsubscribed" : "active";
  const updates: Record<string, string | null> = { status: newStatus };
  if (newStatus === "unsubscribed") {
    updates.unsubscribed_at = new Date().toISOString();
  } else {
    updates.unsubscribed_at = null;
  }

  const { error } = await supabase
    .from("blog_subscribers")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(`Failed to toggle: ${error.message}`);
  revalidatePath("/admin/subscribers");
}

export async function deletePushSubscriber(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete: ${error.message}`);
  revalidatePath("/admin/subscribers");
}

// ============ PUSH NOTIFICATIONS ============

export async function sendPushToAll(title: string, body: string, url: string) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Service client not configured");

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) throw new Error("VAPID keys not configured");

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, keys_p256dh, keys_auth");

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:contact@level8.bg", vapidPublic, vapidPrivate);

  const payload = JSON.stringify({ title, body, url });
  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
        },
        payload
      ).then(() => { sent++; })
      .catch((err: unknown) => {
        failed++;
        if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
          supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      })
    )
  );

  return { sent, failed, total: subs.length };
}

export async function sendPushForPost(postId: string) {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Service client not configured");

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt")
    .eq("id", postId)
    .single();

  if (!post) throw new Error("Post not found");

  const postUrl = `https://level8.bg/blog/${post.slug}`;
  return sendPushToAll(
    post.title,
    post.excerpt || "\u041D\u043E\u0432\u0430 \u0441\u0442\u0430\u0442\u0438\u044F \u0432 \u0431\u043B\u043E\u0433\u0430 \u043D\u0430 \u041B\u0415\u0412\u0415\u041B 8",
    postUrl
  );
}

export async function sendManualPush(title: string, body: string, url: string) {
  return sendPushToAll(title, body, url);
}

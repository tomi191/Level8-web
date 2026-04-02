export const maxDuration = 300;

import { NextResponse } from "next/server";
import { fetchRssArticles } from "@/lib/content-engine/research/rss-aggregator";
import { rankTopics } from "@/lib/content-engine/research/topic-ranker";
import {
  generateAndSaveDraft,
  generateImagesForPost,
  publishPost,
  notifyOnPublishServer,
  getServiceClient,
} from "@/lib/blog-actions-server";

/**
 * Daily cron: AI News Autopilot
 *
 * 1. Fetch RSS articles from AI news sources
 * 2. Rank topics by importance for Bulgarian business audience
 * 3. Generate blog post, images, publish, and distribute to social channels
 * 4. Send Telegram notification to admin
 *
 * Vercel Cron: schedule "0 7 * * *" (7:00 AM UTC daily)
 */

const TELEGRAM_API = "https://api.telegram.org/bot";

// ============ TELEGRAM ADMIN HELPER ============

async function sendAdminTelegram(text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!botToken || !adminChatId) return false;

  try {
    const res = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

// ============ ROUTE HANDLER ============

export async function GET(request: Request) {
  // 1. Auth check — strict Bearer CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    // 2. Fetch RSS articles
    const articles = await fetchRssArticles();
    console.log(`[ai-news] Fetched ${articles.length} RSS articles`);

    if (articles.length === 0) {
      await sendAdminTelegram(
        "\u{1F916} <b>AI News Autopilot</b>\n\n" +
          "\u{26A0}\u{FE0F} \u041D\u044F\u043C\u0430 \u043D\u043E\u0432\u0438 \u0441\u0442\u0430\u0442\u0438\u0438 \u043E\u0442 RSS \u0438\u0437\u0442\u043E\u0447\u043D\u0438\u0446\u0438\u0442\u0435 \u0437\u0430 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0442\u0435 24 \u0447\u0430\u0441\u0430."
      );
      return NextResponse.json({
        ok: false,
        reason: "No RSS articles found",
        durationMs: Date.now() - start,
      });
    }

    // 3. Get recent blog titles (last 7 days) to avoid duplicates
    const supabase = getServiceClient();
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: recentPosts } = await supabase
      .from("blog_posts")
      .select("title")
      .gte("created_at", sevenDaysAgo);

    const recentTitles = (recentPosts ?? []).map((p) => p.title);
    console.log(`[ai-news] Found ${recentTitles.length} recent blog titles`);

    // 4. Rank topics
    const ranked = await rankTopics(articles, recentTitles);

    if (!ranked) {
      await sendAdminTelegram(
        "\u{1F916} <b>AI News Autopilot</b>\n\n" +
          "\u{2705} \u0412\u0441\u0438\u0447\u043A\u0438 \u0442\u0435\u043C\u0438 \u0432\u0435\u0447\u0435 \u0441\u0430 \u043F\u043E\u043A\u0440\u0438\u0442\u0438. \u041D\u044F\u043C\u0430 \u043D\u043E\u0432\u0430 \u0441\u0442\u0430\u0442\u0438\u044F \u0434\u043D\u0435\u0441."
      );
      return NextResponse.json({
        ok: false,
        reason: "All topics already covered",
        durationMs: Date.now() - start,
      });
    }

    console.log(
      `[ai-news] Ranked topic: "${ranked.topic}" (importance: ${ranked.importance}/10)`
    );

    // 5. Build extra context from the source article
    const extraContext =
      `\u0422\u043E\u0432\u0430 \u0435 \u043D\u043E\u0432\u0438\u043D\u0430\u0440\u0441\u043A\u0430 \u0441\u0442\u0430\u0442\u0438\u044F, \u0431\u0430\u0437\u0438\u0440\u0430\u043D\u0430 \u043D\u0430 \u0440\u0435\u0430\u043B\u043D\u0430 AI \u043D\u043E\u0432\u0438\u043D\u0430.\n\n` +
      `\u0418\u0437\u0442\u043E\u0447\u043D\u0438\u043A: ${ranked.sourceArticle.source}\n` +
      `\u0417\u0430\u0433\u043B\u0430\u0432\u0438\u0435: ${ranked.sourceArticle.title}\n` +
      `\u0420\u0435\u0437\u044E\u043C\u0435: ${ranked.sourceArticle.summary}\n` +
      `URL: ${ranked.sourceArticle.url}\n\n` +
      `\u0418\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0438:\n` +
      `- \u0410\u0434\u0430\u043F\u0442\u0438\u0440\u0430\u0439 \u0441\u044A\u0434\u044A\u0440\u0436\u0430\u043D\u0438\u0435\u0442\u043E \u0437\u0430 \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0430 \u0431\u0438\u0437\u043D\u0435\u0441 \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044F.\n` +
      `- \u041E\u0431\u044F\u0441\u043D\u0438 \u043A\u0430\u043A\u0432\u043E \u043E\u0437\u043D\u0430\u0447\u0430\u0432\u0430 \u0442\u043E\u0432\u0430 \u0437\u0430 \u0431\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438 \u0444\u0438\u0440\u043C\u0438 \u0438 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u0435\u043C\u0430\u0447\u0438.\n` +
      `- \u0414\u043E\u0431\u0430\u0432\u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u044A\u0432\u0435\u0442\u0438 \u0438 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u0438 \u043F\u0440\u0438\u043C\u0435\u0440\u0438.\n` +
      `- \u0421\u043F\u043E\u043C\u0435\u043D\u0438 \u0438\u0437\u0442\u043E\u0447\u043D\u0438\u043A\u0430 \u0432 \u0441\u0442\u0430\u0442\u0438\u044F\u0442\u0430 (\u0430\u0442\u0440\u0438\u0431\u0443\u0446\u0438\u044F).\n` +
      `- \u041E\u0431\u043E\u0441\u043D\u043E\u0432\u043A\u0430 \u043D\u0430 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u0430: ${ranked.reasoning}`;

    // 6. Generate blog post draft
    const draft = await generateAndSaveDraft({
      topic: ranked.topic,
      keywords: ranked.keywords,
      contentType: ranked.contentType,
      category: "ai-news",
      targetWordCount: ranked.targetWords,
      extraContext,
    });

    console.log(
      `[ai-news] Draft saved: "${draft.title}" (${draft.wordCount} words)`
    );

    // 7. Generate images (non-blocking — continue on failure)
    try {
      await generateImagesForPost(draft.id);
      console.log(`[ai-news] Images generated for post ${draft.id}`);
    } catch (imgErr) {
      console.warn(
        `[ai-news] Image generation failed (continuing without images):`,
        imgErr instanceof Error ? imgErr.message : String(imgErr)
      );
    }

    // 8. Publish
    await publishPost(draft.id);
    console.log(`[ai-news] Post published: ${draft.slug}`);

    // 9. Social distribution (fire-and-forget)
    notifyOnPublishServer(draft.id).catch((err) =>
      console.error("[ai-news] Social distribution error:", err)
    );

    // 10. Telegram admin notification
    const bgTime = new Date().toLocaleString("bg-BG", {
      timeZone: "Europe/Sofia",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const postUrl = `https://level8.bg/blog/${draft.slug}`;

    await sendAdminTelegram(
      `\u{1F916} <b>AI News Autopilot</b>\n\n` +
        `\u{1F4F0} ${draft.title}\n` +
        `\u{1F4CA} Importance: ${ranked.importance}/10 | ${draft.wordCount} \u0434\u0443\u043C\u0438\n` +
        `\u{1F517} ${postUrl}\n\n` +
        `Auto-published at ${bgTime}`
    );

    // 11. Return JSON
    return NextResponse.json({
      ok: true,
      title: draft.title,
      importance: ranked.importance,
      wordCount: draft.wordCount,
      url: postUrl,
      durationMs: Date.now() - start,
    });
  } catch (err) {
    // 12. Error handling — alert admin and return 500
    const errorMessage =
      err instanceof Error ? err.message : String(err);
    console.error("[ai-news] Cron failed:", errorMessage);

    await sendAdminTelegram(
      `\u{1F916} <b>AI News Autopilot</b>\n\n` +
        `\u{1F6A8} <b>\u0413\u0440\u0435\u0448\u043A\u0430!</b>\n` +
        `${errorMessage.slice(0, 500)}`
    ).catch(() => {});

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
        durationMs: Date.now() - start,
      },
      { status: 500 }
    );
  }
}

/**
 * Topic Ranker — AI-powered news selection
 *
 * Given a list of RSS articles, uses Gemini Flash (free) to pick
 * the most important story for a Bulgarian business audience,
 * returning a ranked topic with SEO keywords and content config.
 */

import { complete } from "../ai/openrouter-client";
import { getContentEngine } from "../create-engine";
import type { RssArticle } from "./rss-aggregator";

// ============ TYPES ============

export interface RankedTopic {
  /** Bulgarian title for the blog article */
  topic: string;
  /** Bulgarian SEO keywords (5-8) */
  keywords: string[];
  /** Importance score 1-10 */
  importance: number;
  /** Content type: tofu (brief) or mofu (analysis) */
  contentType: "tofu" | "mofu";
  /** Target word count: 500 (tofu) or 1200 (mofu) */
  targetWords: number;
  /** The original RSS article this topic is based on */
  sourceArticle: RssArticle;
  /** Why this topic matters (in Bulgarian) */
  reasoning: string;
}

// ============ CONSTANTS ============

const FREE_MODEL = "google/gemini-2.0-flash-exp:free";
const MAX_ARTICLES_FOR_AI = 15;
const OVERLAP_THRESHOLD = 0.6;
const MIN_WORD_LENGTH = 3;

const SYSTEM_PROMPT =
  "Ти си редактор на български технологичен блог. " +
  "Анализирай тези AI новини и избери НАЙ-ВАЖНАТА за българска бизнес аудитория.";

// ============ INTERNAL HELPERS ============

/**
 * Extract significant words from a title for overlap comparison.
 * Case-insensitive, ignores words shorter than MIN_WORD_LENGTH.
 */
function extractWords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z0-9\u0400-\u04ff]+/)
    .filter((w) => w.length >= MIN_WORD_LENGTH);
}

/**
 * Compute word-overlap ratio between two titles.
 * Returns |intersection| / |smaller set|.
 */
function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(extractWords(a));
  const wordsB = new Set(extractWords(b));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  return intersection / Math.min(wordsA.size, wordsB.size);
}

/**
 * Filter out articles whose title has >60% word overlap
 * with any already-covered title.
 */
function filterCoveredTopics(
  articles: RssArticle[],
  alreadyCovered: string[]
): RssArticle[] {
  if (alreadyCovered.length === 0) return articles;

  return articles.filter((article) => {
    for (const coveredTitle of alreadyCovered) {
      if (wordOverlap(article.title, coveredTitle) > OVERLAP_THRESHOLD) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Build the numbered article list for the AI prompt.
 */
function buildArticleList(articles: RssArticle[]): string {
  return articles
    .map(
      (a, i) =>
        `${i + 1}. [${a.source}] ${a.title}\n   ${a.summary || "(няма описание)"}`
    )
    .join("\n\n");
}

/**
 * Strip markdown code fences from AI response before JSON parsing.
 */
function stripCodeFences(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

// ============ PUBLIC API ============

/**
 * Rank RSS articles and pick the single most important topic
 * for a Bulgarian business audience.
 *
 * @param articles - Fresh RSS articles to evaluate
 * @param alreadyCovered - Titles of recently published blog posts (last 7 days)
 * @returns The top-ranked topic, or null if nothing newsworthy remains
 */
export async function rankTopics(
  articles: RssArticle[],
  alreadyCovered: string[]
): Promise<RankedTopic | null> {
  // Step 1: Filter out already-covered topics
  const fresh = filterCoveredTopics(articles, alreadyCovered);
  if (fresh.length === 0) return null;

  // Step 2: Take top N by recency (articles should already be sorted,
  // but ensure we don't overwhelm the AI context)
  const top = fresh.slice(0, MAX_ARTICLES_FOR_AI);

  // Step 3: Build AI prompt
  const articleList = buildArticleList(top);
  const userPrompt =
    `Ето ${top.length} AI новини от последните 24 часа:\n\n` +
    `${articleList}\n\n` +
    `Избери НАЙ-ВАЖНАТА новина за българска бизнес аудитория.\n` +
    `Върни САМО валиден JSON (без допълнителен текст) с тези полета:\n` +
    `- "selectedIndex": номерът на избраната новина (1-${top.length})\n` +
    `- "topic": заглавие на български за блог статия\n` +
    `- "keywords": масив от 5-8 SEO ключови думи на български\n` +
    `- "importance": число от 1 до 10 (колко е важна новината)\n` +
    `- "reasoning": кратко обяснение защо тази новина е важна за българския бизнес`;

  // Step 4: Call AI with free model
  const config = getContentEngine();
  const freeConfig = { ...config, defaultTextModel: FREE_MODEL };

  const result = await complete(freeConfig, {
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    model: FREE_MODEL,
    temperature: 0.3,
  });

  // Step 5: Parse response
  const cleaned = stripCodeFences(result.content);

  let parsed: {
    selectedIndex: number;
    topic: string;
    keywords: string[];
    importance: number;
    reasoning: string;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error(
      "[topic-ranker] Failed to parse AI response:",
      result.content
    );
    return null;
  }

  // Validate selectedIndex
  const idx = parsed.selectedIndex;
  if (typeof idx !== "number" || idx < 1 || idx > top.length) {
    console.error(
      "[topic-ranker] Invalid selectedIndex:",
      idx,
      "max:",
      top.length
    );
    return null;
  }

  const sourceArticle = top[idx - 1];
  const importance = Math.max(1, Math.min(10, Math.round(parsed.importance)));

  // Step 6: Map importance to content config
  const isHighImportance = importance >= 7;

  return {
    topic: parsed.topic,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    importance,
    contentType: isHighImportance ? "mofu" : "tofu",
    targetWords: isHighImportance ? 1200 : 500,
    sourceArticle,
    reasoning: parsed.reasoning || "",
  };
}

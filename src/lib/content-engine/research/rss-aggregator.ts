/**
 * RSS Aggregator — AI News Sources
 *
 * Fetches and aggregates articles from RSS feeds (Google News,
 * company blogs, tech publications). Deduplicates by title
 * similarity and filters to last 24 hours.
 */

import { XMLParser } from "fast-xml-parser";

// ============ TYPES ============

export interface RssSource {
  url: string;
  name: string;
}

export interface RssArticle {
  title: string;
  url: string;
  summary: string;
  publishedAt: Date;
  source: string;
}

// ============ SOURCES ============

/**
 * RSS feed sources grouped by category.
 * Exported so consumers can extend or filter.
 */
export const RSS_SOURCES: RssSource[] = [
  // --- Google News (AI queries) ---
  {
    url: "https://news.google.com/rss/search?q=artificial+intelligence&hl=en&gl=US&ceid=US:en",
    name: "Google News (AI)",
  },
  {
    url: "https://news.google.com/rss/search?q=ChatGPT+OR+Claude+OR+Gemini+AI&hl=en&gl=US&ceid=US:en",
    name: "Google News (ChatGPT/Claude/Gemini)",
  },
  {
    url: "https://news.google.com/rss/search?q=%D0%B8%D0%B7%D0%BA%D1%83%D1%81%D1%82%D0%B2%D0%B5%D0%BD+%D0%B8%D0%BD%D1%82%D0%B5%D0%BB%D0%B5%D0%BA%D1%82&hl=bg&gl=BG&ceid=BG:bg",
    name: "Google News (AI BG)",
  },

  // --- Company blogs ---
  {
    url: "https://openai.com/blog/rss.xml",
    name: "OpenAI Blog",
  },
  {
    url: "https://www.anthropic.com/rss.xml",
    name: "Anthropic Blog",
  },
  {
    url: "https://blog.google/technology/ai/rss/",
    name: "Google AI Blog",
  },

  // --- Tech publications ---
  {
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    name: "TechCrunch AI",
  },
  {
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    name: "The Verge AI",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/index",
    name: "Ars Technica",
  },
];

// ============ CONSTANTS ============

const FETCH_TIMEOUT_MS = 10_000;
const TWENTY_FOUR_HOURS_MS = 86_400_000;
const USER_AGENT = "Level8-NewsBot/1.0";
const DEDUP_SIMILARITY_THRESHOLD = 0.7;

/**
 * English stop words excluded from title similarity comparison.
 * Kept minimal to cover the most common noise words.
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "has",
  "have",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "not",
  "no",
  "nor",
  "so",
  "if",
  "as",
  "up",
  "out",
  "about",
  "into",
  "over",
  "after",
  "than",
  "also",
  "just",
  "more",
  "how",
  "all",
  "new",
  "s", // possessive fragment from split
]);

// ============ XML PARSER ============

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "_",
  // Ensure single items are still returned as arrays
  isArray: (tagName) =>
    tagName === "item" || tagName === "entry",
});

// ============ INTERNAL HELPERS ============

/**
 * Fetch a URL with a timeout using AbortController.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Strip HTML tags from a string (for description fields that
 * include markup).
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Parse a date string into a Date object. Returns null if
 * the string is not a valid date.
 */
function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Extract significant (non-stop-word) tokens from a title.
 * Lowercased, split on non-alphanumeric characters, filtered.
 */
function significantWords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z0-9\u0400-\u04ff]+/) // split on non-alphanumeric (include Cyrillic)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Compute word-overlap similarity between two titles.
 * Returns a value between 0 (no overlap) and 1 (identical words).
 *
 * Formula: |intersection| / |smaller set|
 * Using the smaller set as denominator means a short title
 * that is fully contained in a longer one scores 1.0.
 */
function titleSimilarity(a: string, b: string): number {
  const wordsA = significantWords(a);
  const wordsB = significantWords(b);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) intersection++;
  }

  const smallerSize = Math.min(setA.size, setB.size);
  return intersection / smallerSize;
}

// ============ FEED PARSING ============

interface RawRssItem {
  title?: string;
  link?: string | { _href?: string };
  description?: string;
  summary?: string;
  content?: string;
  pubDate?: string;
  published?: string;
  updated?: string;
  source?: string | { "#text"?: string; _?: string; _url?: string };
}

/**
 * Parse a single RSS/Atom feed XML string into RssArticle[].
 * Handles both RSS 2.0 (`rss.channel.item`) and Atom (`feed.entry`) formats.
 */
function parseFeedXml(xml: string, sourceName: string): RssArticle[] {
  const parsed = xmlParser.parse(xml);
  const articles: RssArticle[] = [];

  // Determine items array: RSS 2.0 vs Atom
  let items: RawRssItem[] = [];

  if (parsed.rss?.channel?.item) {
    items = parsed.rss.channel.item;
  } else if (parsed.feed?.entry) {
    items = parsed.feed.entry;
  } else if (parsed.rss?.channel) {
    // Feed exists but has no items
    return [];
  }

  // Ensure items is always an array (isArray config should handle this,
  // but guard just in case)
  if (!Array.isArray(items)) {
    items = [items];
  }

  for (const item of items) {
    // --- Title ---
    const title = typeof item.title === "string" ? item.title.trim() : "";
    if (!title) continue;

    // --- URL ---
    let url = "";
    if (typeof item.link === "string") {
      url = item.link;
    } else if (item.link && typeof item.link === "object" && item.link._href) {
      // Atom <link href="..."/>
      url = item.link._href;
    }
    if (!url) continue;

    // --- Summary ---
    const rawSummary =
      (typeof item.description === "string" ? item.description : "") ||
      (typeof item.summary === "string" ? item.summary : "") ||
      (typeof item.content === "string" ? item.content : "") ||
      "";
    const summary = stripHtml(rawSummary).slice(0, 500);

    // --- Published date ---
    const dateStr = item.pubDate || item.published || item.updated;
    const publishedAt = parseDate(typeof dateStr === "string" ? dateStr : null);
    if (!publishedAt) continue; // skip items without a parseable date

    // --- Source name ---
    // Google News items have a <source> element with the publisher name
    let feedSource = sourceName;
    if (item.source) {
      if (typeof item.source === "string") {
        feedSource = item.source;
      } else if (typeof item.source === "object") {
        const text = item.source["#text"] || item.source._ || "";
        if (text) feedSource = text;
      }
    }

    articles.push({
      title,
      url,
      summary,
      publishedAt,
      source: feedSource,
    });
  }

  return articles;
}

// ============ DEDUPLICATION ============

/**
 * Deduplicate articles by title similarity.
 *
 * For each pair of articles whose titles share >70% of significant
 * words, keep the one with the longer summary (more informative).
 */
function deduplicateArticles(articles: RssArticle[]): RssArticle[] {
  // Track which indices have been marked as duplicates
  const removed = new Set<number>();

  for (let i = 0; i < articles.length; i++) {
    if (removed.has(i)) continue;

    for (let j = i + 1; j < articles.length; j++) {
      if (removed.has(j)) continue;

      const sim = titleSimilarity(articles[i].title, articles[j].title);

      if (sim > DEDUP_SIMILARITY_THRESHOLD) {
        // Keep the article with the longer summary
        const keepI = articles[i].summary.length >= articles[j].summary.length;
        removed.add(keepI ? j : i);

        // If we removed i, stop comparing i against further j's
        if (!keepI) break;
      }
    }
  }

  return articles.filter((_, idx) => !removed.has(idx));
}

// ============ PUBLIC API ============

/**
 * Fetch articles from all configured RSS sources, filter to the
 * last 24 hours, deduplicate, and return sorted by date descending.
 *
 * Failed feeds are silently skipped (logged to console.warn).
 *
 * @param sources — override the default RSS_SOURCES if needed
 * @returns RssArticle[] sorted newest-first
 */
export async function fetchRssArticles(
  sources: RssSource[] = RSS_SOURCES
): Promise<RssArticle[]> {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  // Fetch all feeds in parallel — tolerate individual failures
  const results = await Promise.allSettled(
    sources.map(async (source): Promise<RssArticle[]> => {
      const res = await fetchWithTimeout(source.url, FETCH_TIMEOUT_MS);

      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status} from ${source.name} (${source.url})`
        );
      }

      const xml = await res.text();
      return parseFeedXml(xml, source.name);
    })
  );

  // Collect successful articles, warn on failures
  const allArticles: RssArticle[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    } else {
      console.warn(
        `[rss-aggregator] Failed to fetch ${sources[i].name}: ${result.reason}`
      );
    }
  }

  // Filter to last 24 hours
  const recent = allArticles.filter(
    (article) => article.publishedAt >= cutoff
  );

  // Sort newest first
  recent.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  // Deduplicate similar titles
  return deduplicateArticles(recent);
}

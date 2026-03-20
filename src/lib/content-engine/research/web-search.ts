/**
 * Web Search Module — Tavily API
 *
 * Fetches real-time web results to ground AI blog generation
 * in current, factual information.
 */

export interface WebSearchConfig {
  apiKey: string;
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  includeAnswer?: boolean;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface WebSearchResult {
  answer?: string;
  results: SearchResult[];
  query: string;
}

/**
 * Search the web using Tavily API.
 *
 * Builds a query from the topic + top keywords and returns
 * structured results with snippets.
 */
export async function searchWeb(
  config: WebSearchConfig,
  topic: string,
  keywords: string[]
): Promise<WebSearchResult> {
  const topKeywords = keywords.slice(0, 3).join(", ");
  const query = topKeywords ? `${topic} (${topKeywords})` : topic;

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: config.apiKey,
      query,
      search_depth: config.searchDepth ?? "advanced",
      max_results: config.maxResults ?? 5,
      include_answer: config.includeAnswer ?? true,
      include_raw_content: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily search failed (${res.status}): ${text}`);
  }

  const data = await res.json();

  return {
    answer: data.answer || undefined,
    query,
    results: (data.results || []).map((r: Record<string, unknown>) => ({
      title: r.title as string,
      url: r.url as string,
      content: r.content as string,
      score: r.score as number,
      publishedDate: (r.published_date as string) || undefined,
    })),
  };
}

/**
 * Format search results as structured context for the AI prompt.
 */
export function formatSearchContext(result: WebSearchResult): string {
  const lines: string[] = [
    "====================",
    "WEB RESEARCH (актуална информация от интернет)",
    "====================",
    "",
  ];

  if (result.answer) {
    lines.push(`ОБОБЩЕНИЕ: ${result.answer}`, "");
  }

  for (let i = 0; i < result.results.length; i++) {
    const r = result.results[i];
    lines.push(`ИЗТОЧНИК ${i + 1}: ${r.title}`);
    lines.push(`URL: ${r.url}`);
    if (r.publishedDate) {
      lines.push(`ДАТА: ${r.publishedDate}`);
    }
    lines.push(r.content, "");
  }

  lines.push(
    "ВАЖНО: Използвай горната информация за актуални данни, статистики и примери. Цитирай източници където е уместно."
  );

  return lines.join("\n");
}

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
    "WEB RESEARCH (\u0430\u043A\u0442\u0443\u0430\u043B\u043D\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E\u0442 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442)",
    "====================",
    "",
  ];

  if (result.answer) {
    lines.push(`\u041E\u0411\u041E\u0411\u0429\u0415\u041D\u0418\u0415: ${result.answer}`, "");
  }

  for (let i = 0; i < result.results.length; i++) {
    const r = result.results[i];
    lines.push(`\u0418\u0417\u0422\u041E\u0427\u041D\u0418\u041A ${i + 1}: ${r.title}`);
    lines.push(`URL: ${r.url}`);
    if (r.publishedDate) {
      lines.push(`\u0414\u0410\u0422\u0410: ${r.publishedDate}`);
    }
    lines.push(r.content, "");
  }

  lines.push(
    "\u0412\u0410\u0416\u041D\u041E: \u0418\u0437\u043F\u043E\u043B\u0437\u0432\u0430\u0439 \u0433\u043E\u0440\u043D\u0430\u0442\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0437\u0430 \u0430\u043A\u0442\u0443\u0430\u043B\u043D\u0438 \u0434\u0430\u043D\u043D\u0438, \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438 \u0438 \u043F\u0440\u0438\u043C\u0435\u0440\u0438. \u0426\u0438\u0442\u0438\u0440\u0430\u0439 \u0438\u0437\u0442\u043E\u0447\u043D\u0438\u0446\u0438 \u043A\u044A\u0434\u0435\u0442\u043E \u0435 \u0443\u043C\u0435\u0441\u0442\u043D\u043E."
  );

  return lines.join("\n");
}

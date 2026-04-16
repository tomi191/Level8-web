import { NextResponse, type NextRequest } from "next/server";

const GRAPH_API = "https://graph.facebook.com/v22.0";
const POSTS_LIMIT = 12;
const CACHE_TTL_SECONDS = 300; // 5 минути — по-чести обновявания при публикация

interface InstagramMedia {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption: string;
  timestamp: string;
  mediaType: string;
}

function cacheHeaders(ttl: number): Record<string, string> {
  return {
    "Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
  };
}

export async function GET(request: NextRequest) {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  // Manual refresh: /api/instagram/feed?refresh=1 → bypass-ва Next cache
  const forceRefresh = request.nextUrl.searchParams.get("refresh") === "1";

  if (!accountId || !accessToken) {
    return NextResponse.json(
      { posts: [] as InstagramMedia[] },
      { headers: cacheHeaders(CACHE_TTL_SECONDS) }
    );
  }

  try {
    const res = await fetch(
      `${GRAPH_API}/${accountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${POSTS_LIMIT}&access_token=${accessToken}`,
      forceRefresh
        ? { cache: "no-store" }
        : { next: { revalidate: CACHE_TTL_SECONDS, tags: ["instagram-feed"] } }
    );

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { posts: [] as InstagramMedia[], error: data.error.message },
        {
          status: 200,
          headers: forceRefresh ? { "Cache-Control": "no-store" } : cacheHeaders(CACHE_TTL_SECONDS),
        }
      );
    }

    const posts: InstagramMedia[] = (data.data || []).map(
      (p: Record<string, string>) => ({
        id: p.id,
        mediaUrl: p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url,
        permalink: p.permalink,
        caption: (p.caption || "").slice(0, 120),
        timestamp: p.timestamp,
        mediaType: p.media_type,
      })
    );

    return NextResponse.json(
      { posts, count: posts.length },
      {
        headers: forceRefresh ? { "Cache-Control": "no-store" } : cacheHeaders(CACHE_TTL_SECONDS),
      }
    );
  } catch {
    return NextResponse.json(
      { posts: [] as InstagramMedia[] },
      { headers: cacheHeaders(CACHE_TTL_SECONDS) }
    );
  }
}

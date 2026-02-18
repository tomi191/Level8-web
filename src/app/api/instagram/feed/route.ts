import { NextResponse } from "next/server";

const GRAPH_API = "https://graph.facebook.com/v22.0";

interface InstagramMedia {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption: string;
  timestamp: string;
  mediaType: string;
}

export async function GET() {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    return NextResponse.json(
      { posts: [] as InstagramMedia[] },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }

  try {
    const res = await fetch(
      `${GRAPH_API}/${accountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=9&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }
    );

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { posts: [] as InstagramMedia[] },
        { headers: { "Cache-Control": "public, s-maxage=3600" } }
      );
    }

    const posts: InstagramMedia[] = (data.data || []).map(
      (p: Record<string, string>) => ({
        id: p.id,
        mediaUrl:
          p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url,
        permalink: p.permalink,
        caption: (p.caption || "").slice(0, 120),
        timestamp: p.timestamp,
        mediaType: p.media_type,
      })
    );

    return NextResponse.json(
      { posts },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch {
    return NextResponse.json(
      { posts: [] as InstagramMedia[] },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }
}

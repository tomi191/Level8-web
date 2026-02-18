import { NextRequest, NextResponse } from "next/server";

const GRAPH_API = "https://graph.facebook.com/v22.0";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { reaction_count: 0, comment_count: 0, share_count: 0 },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }

  try {
    const res = await fetch(
      `${GRAPH_API}/?id=${encodeURIComponent(url)}&fields=engagement&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }
    );

    const data = await res.json();

    if (data.error) {
      // URL not found in Facebook's graph — return zeros
      return NextResponse.json(
        { reaction_count: 0, comment_count: 0, share_count: 0 },
        { headers: { "Cache-Control": "public, s-maxage=3600" } }
      );
    }

    const engagement = data.engagement || {};
    return NextResponse.json(
      {
        reaction_count: engagement.reaction_count || 0,
        comment_count: engagement.comment_count || 0,
        share_count: engagement.share_count || 0,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch {
    return NextResponse.json(
      { reaction_count: 0, comment_count: 0, share_count: 0 },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }
}

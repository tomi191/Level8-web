import { NextResponse } from "next/server";

const GRAPH_API = "https://graph.facebook.com/v22.0";

export async function GET() {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    return NextResponse.json(
      { followers: 0, posts: 0, username: "" },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }

  try {
    const res = await fetch(
      `${GRAPH_API}/${accountId}?fields=followers_count,media_count,username&access_token=${accessToken}`,
      { next: { revalidate: 3600 } }
    );

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { followers: 0, posts: 0, username: "" },
        { headers: { "Cache-Control": "public, s-maxage=3600" } }
      );
    }

    return NextResponse.json(
      {
        followers: data.followers_count || 0,
        posts: data.media_count || 0,
        username: data.username || "",
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch {
    return NextResponse.json(
      { followers: 0, posts: 0, username: "" },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  }
}

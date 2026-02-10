import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getPublicSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = getPublicSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, content, featured_image, published_at, category, keywords")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (posts || [])
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://level8.bg/blog/${post.slug}</link>
      <guid isPermaLink="true">https://level8.bg/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt || "")}</description>
      <pubDate>${new Date(post.published_at || "").toUTCString()}</pubDate>
      <dc:creator>\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414</dc:creator>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      ${post.keywords?.map((kw: string) => `<category>${escapeXml(kw)}</category>`).join("") || ""}
      ${post.content ? `<content:encoded><![CDATA[${post.content}]]></content:encoded>` : ""}
      ${post.featured_image ? `<media:content url="${escapeXml(post.featured_image)}" medium="image" type="image/webp" />` : ""}
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>\u041B\u0415\u0412\u0415\u041B 8 \u0411\u043B\u043E\u0433</title>
    <link>https://level8.bg/blog</link>
    <description>\u0421\u0442\u0430\u0442\u0438\u0438 \u0437\u0430 \u0434\u0438\u0433\u0438\u0442\u0430\u043B\u0435\u043D \u043C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433, SEO, \u0435-\u0442\u044A\u0440\u0433\u043E\u0432\u0438\u044F \u0438 AI \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F.</description>
    <language>bg</language>
    <atom:link href="https://level8.bg/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

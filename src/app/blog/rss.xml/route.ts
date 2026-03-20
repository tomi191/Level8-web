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
    .select("title, slug, excerpt, content, image, published_at, category, keywords")
    .eq("published", true)
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
      <dc:creator>ЛЕВЕЛ 8 ЕООД</dc:creator>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      ${Array.isArray(post.keywords) ? (post.keywords as string[]).map((kw) => `<category>${escapeXml(kw)}</category>`).join("") : ""}
      ${post.content ? `<content:encoded><![CDATA[${post.content}]]></content:encoded>` : ""}
      ${post.image ? `<media:content url="${escapeXml(post.image)}" medium="image" type="image/webp" />` : ""}
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
    <title>ЛЕВЕЛ 8 Блог</title>
    <link>https://level8.bg/blog</link>
    <description>Статии за дигитален маркетинг, SEO, е-търговия и AI автоматизация.</description>
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

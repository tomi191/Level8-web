import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Clock, ArrowRight } from "lucide-react";
import type { Database } from "@/types/database";
import { SubscribeForm } from "@/components/blog/subscribe-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "\u0411\u043B\u043E\u0433 | \u041B\u0415\u0412\u0415\u041B 8",
  description:
    "\u0421\u0442\u0430\u0442\u0438\u0438 \u0437\u0430 \u0434\u0438\u0433\u0438\u0442\u0430\u043B\u0435\u043D \u043C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433, SEO, \u0435-\u0442\u044A\u0440\u0433\u043E\u0432\u0438\u044F \u0438 AI \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u043E\u0442 \u0435\u043A\u0438\u043F\u0430 \u043D\u0430 Level 8.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "\u0411\u043B\u043E\u0433 | \u041B\u0415\u0412\u0415\u041B 8",
    description: "\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u044A\u0432\u0435\u0442\u0438 \u0437\u0430 \u0434\u0438\u0433\u0438\u0442\u0430\u043B\u0435\u043D \u0440\u0430\u0441\u0442\u0435\u0436, SEO, \u0435-\u0442\u044A\u0440\u0433\u043E\u0432\u0438\u044F \u0438 AI \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F.",
    type: "website",
    locale: "bg_BG",
    url: "https://level8.bg/blog",
    siteName: "\u041B\u0415\u0412\u0415\u041B 8",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "\u0411\u043B\u043E\u0433 | \u041B\u0415\u0412\u0415\u041B 8",
    description: "\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u044A\u0432\u0435\u0442\u0438 \u0437\u0430 \u0434\u0438\u0433\u0438\u0442\u0430\u043B\u0435\u043D \u0440\u0430\u0441\u0442\u0435\u0436, SEO, \u0435-\u0442\u044A\u0440\u0433\u043E\u0432\u0438\u044F \u0438 AI \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F.",
    images: ["/opengraph-image"],
  },
};

// Use anon client for public data (RLS allows SELECT on published posts)
function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const supabase = getPublicSupabase();

  const result = supabase
    ? await supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, featured_image, category, reading_time, published_at"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
    : null;

  const posts = result?.data || null;

  // CollectionPage JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "\u0411\u043B\u043E\u0433 | \u041B\u0415\u0412\u0415\u041B 8",
    description: "\u0421\u0442\u0430\u0442\u0438\u0438 \u0437\u0430 \u0434\u0438\u0433\u0438\u0442\u0430\u043B\u0435\u043D \u043C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433, SEO, \u0435-\u0442\u044A\u0440\u0433\u043E\u0432\u0438\u044F \u0438 AI \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F.",
    url: "https://level8.bg/blog",
    inLanguage: "bg",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (posts || []).map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://level8.bg/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
    />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-10 md:mb-14">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          {"// \u0411\u041B\u041E\u0413"}
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
          {"\u0421\u0442\u0430\u0442\u0438\u0438 \u0438 "}
          <span className="text-neon text-glow-neon">{"\u0420\u0435\u0441\u0443\u0440\u0441\u0438"}</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
          {"\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u044A\u0432\u0435\u0442\u0438 \u0437\u0430 \u0434\u0438\u0433\u0438\u0442\u0430\u043B\u0435\u043D \u0440\u0430\u0441\u0442\u0435\u0436, SEO, \u0435-\u0442\u044A\u0440\u0433\u043E\u0432\u0438\u044F \u0438 AI \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0437\u0430\u0446\u0438\u044F."}
        </p>
      </div>

      {/* Posts grid */}
      {!posts || posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="font-mono text-sm text-muted-foreground/50 space-y-1">
            <p>$ ls blog --status=published</p>
            <p className="text-neon/60">{"> \u0421\u043A\u043E\u0440\u043E \u0442\u0443\u043A \u0449\u0435 \u0441\u0435 \u043F\u043E\u044F\u0432\u044F\u0442 \u043D\u043E\u0432\u0438 \u0441\u0442\u0430\u0442\u0438\u0438."}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-neon/30 transition-all duration-300"
            >
              {post.featured_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {post.category && (
                    <span className="text-xs font-mono text-neon/70 bg-neon/5 px-2 py-0.5 rounded border border-neon/10">
                      {post.category}
                    </span>
                  )}
                  {post.reading_time && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {post.reading_time} {"\u043C\u0438\u043D"}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-lg font-bold text-foreground group-hover:text-neon transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  {post.published_at && (
                    <span className="text-xs text-muted-foreground/60">
                      {formatDate(post.published_at)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-neon font-medium group-hover:gap-2 transition-all">
                    {"\u0427\u0435\u0442\u0438 \u043F\u043E\u0432\u0435\u0447\u0435"}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Subscribe form */}
      <div className="mt-16 max-w-xl mx-auto">
        <SubscribeForm />
      </div>
    </div>
    </>
  );
}

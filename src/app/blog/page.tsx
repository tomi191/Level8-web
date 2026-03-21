import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Clock, ArrowRight } from "lucide-react";
import type { Database } from "@/types/database";
import { SubscribeForm } from "@/components/blog/subscribe-form";

export const revalidate = 1800; // ISR: refresh every 30 min

export const metadata: Metadata = {
  title: "Блог | ЛЕВЕЛ 8",
  description:
    "Статии за дигитален маркетинг, SEO, е-търговия и AI автоматизация от екипа на Level 8.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Блог | ЛЕВЕЛ 8",
    description: "Практически съвети за дигитален растеж, SEO, е-търговия и AI автоматизация.",
    type: "website",
    locale: "bg_BG",
    url: "https://level8.bg/blog",
    siteName: "ЛЕВЕЛ 8",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Блог | ЛЕВЕЛ 8",
    description: "Практически съвети за дигитален растеж, SEO, е-търговия и AI автоматизация.",
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
          "id, title, slug, excerpt, image, category, read_time, published_at"
        )
        .eq("published", true)
        .order("published_at", { ascending: false })
    : null;

  const posts = result?.data || null;

  // CollectionPage JSON-LD
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Блог | ЛЕВЕЛ 8",
    description: "Статии за дигитален маркетинг, SEO, е-търговия и AI автоматизация.",
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
          {"// БЛОГ"}
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
          {"Статии и "}
          <span className="text-neon text-glow-neon">{"Ресурси"}</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
          {"Практически съвети за дигитален растеж, SEO, е-търговия и AI автоматизация."}
        </p>
      </div>

      {/* Posts grid */}
      {!posts || posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="font-mono text-sm text-muted-foreground/50 space-y-1">
            <p>$ ls blog --status=published</p>
            <p className="text-neon/60">{"> Скоро тук ще се появят нови статии."}</p>
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
              {post.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
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
                  {post.read_time && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={12} />
                      {post.read_time} {"мин"}
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
                    {"Чети повече"}
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

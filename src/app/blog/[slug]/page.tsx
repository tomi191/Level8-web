import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Clock, Calendar, ChevronRight, Tag } from "lucide-react";
import type { Database } from "@/types/database";
import { extractHeadings, addHeadingIds, slugifyHeading } from "@/lib/content-engine/utils/html-utils";
import { SubscribeForm } from "@/components/blog/subscribe-form";
import { PushSubscribeButton } from "@/components/blog/push-subscribe-button";

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

// Generate static params for SSG
export async function generateStaticParams() {
  const supabase = getPublicSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");

  return (data || []).map((post) => ({ slug: post.slug }));
}

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getPublicSupabase();
  if (!supabase) return { title: "Blog" };
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, meta_title, meta_description, featured_image, excerpt, published_at, updated_at, category, keywords")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Not Found" };

  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt || "";

  return {
    title: `${title} | \u041B\u0415\u0412\u0415\u041B 8`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "bg_BG",
      url: `https://level8.bg/blog/${slug}`,
      siteName: "\u041B\u0415\u0412\u0415\u041B 8",
      images: post.featured_image ? [{ url: post.featured_image, width: 1200, height: 630, alt: post.title }] : [],
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      section: post.category ?? undefined,
      tags: post.keywords ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getPublicSupabase();
  if (!supabase) notFound();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  // Process content: inject heading IDs for TOC anchors
  const processedContent = post.content ? addHeadingIds(post.content) : '';

  // Table of contents from headings
  const headings = post.content ? extractHeadings(post.content) : [];

  // Related posts (same category, exclude current)
  const { data: related } = await supabase
    .from("blog_posts")
    .select("title, slug, featured_image, excerpt, reading_time")
    .eq("status", "published")
    .neq("slug", slug)
    .limit(3);

  // JSON-LD schemas
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.featured_image || undefined,
    thumbnailUrl: post.featured_image || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    wordCount: post.word_count,
    keywords: post.keywords?.join(", ") || undefined,
    articleSection: post.category || undefined,
    inLanguage: "bg",
    author: {
      "@type": "Organization",
      name: "\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414",
      url: "https://level8.bg",
    },
    publisher: {
      "@type": "Organization",
      name: "\u041B\u0415\u0412\u0415\u041B 8 \u0415\u041E\u041E\u0414",
      url: "https://level8.bg",
      logo: {
        "@type": "ImageObject",
        url: "https://level8.bg/icon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://level8.bg/blog/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "\u041D\u0430\u0447\u0430\u043B\u043E", item: "https://level8.bg/" },
      { "@type": "ListItem", position: 2, name: "\u0411\u043B\u043E\u0433", item: "https://level8.bg/blog" },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-neon transition-colors">{"\u041D\u0430\u0447\u0430\u043B\u043E"}</Link>
          <ChevronRight size={14} className="text-muted-foreground/40" />
          <Link href="/blog" className="hover:text-neon transition-colors">{"\u0411\u043B\u043E\u0433"}</Link>
          <ChevronRight size={14} className="text-muted-foreground/40" />
          <span className="text-foreground/70 truncate max-w-[300px]">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          {/* Main content */}
          <div>
            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {post.category && (
                  <span className="flex items-center gap-1 text-xs font-mono text-neon/70 bg-neon/5 px-2 py-0.5 rounded border border-neon/10">
                    <Tag size={10} />
                    {post.category}
                  </span>
                )}
                {post.reading_time && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {post.reading_time} {"\u043C\u0438\u043D \u0447\u0435\u0442\u0435\u043D\u0435"}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {formatDate(post.published_at)}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
                  {post.excerpt}
                </p>
              )}
            </header>

            {/* Featured image */}
            {post.featured_image && (
              <div className="rounded-2xl overflow-hidden mb-8">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            {/* Article body */}
            {post.content && (
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:font-display prose-headings:text-foreground prose-headings:scroll-mt-24
                  prose-a:text-neon prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-p:text-muted-foreground prose-li:text-muted-foreground
                  prose-blockquote:border-neon/30 prose-blockquote:text-muted-foreground
                  prose-code:text-neon prose-code:bg-neon/5 prose-code:rounded prose-code:px-1
                  prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            )}

            {/* Audio player */}
            {post.audio_url && (
              <div className="mt-10 p-5 rounded-2xl border border-border bg-surface">
                <h3 className="font-mono text-xs text-neon/60 tracking-wider mb-3">
                  {"// \u0421\u041B\u0423\u0428\u0410\u0419\u0422\u0415 \u0421\u0422\u0410\u0422\u0418\u042F\u0422\u0410"}
                </h3>
                <audio controls src={post.audio_url} className="w-full" />
                {post.audio_duration_sec && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {"\u041F\u0440\u043E\u0434\u044A\u043B\u0436\u0438\u0442\u0435\u043B\u043D\u043E\u0441\u0442"}: {Math.round(post.audio_duration_sec / 60)} {"\u043C\u0438\u043D"}
                  </p>
                )}
              </div>
            )}

            {/* Keywords */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="text-xs font-mono text-muted-foreground/60 bg-white/5 px-2 py-1 rounded border border-border"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* Share buttons */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                {"\u0421\u043F\u043E\u0434\u0435\u043B\u0435\u0442\u0435:"}
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=https://level8.bg/blog/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-neon/30"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=https://level8.bg/blog/${slug}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-neon/30"
              >
                X / Twitter
              </a>
              <PushSubscribeButton />
            </div>

            {/* Subscribe form */}
            <div className="mt-10">
              <SubscribeForm />
            </div>
          </div>

          {/* Sidebar \u2014 TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {headings.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <h3 className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase mb-3">
                    {"// \u0421\u042A\u0414\u042A\u0420\u0416\u0410\u041D\u0418\u0415"}
                  </h3>
                  <nav className="space-y-1">
                    {headings.map((h, i) => (
                      <a
                        key={i}
                        href={`#${slugifyHeading(h.text)}`}
                        className={`block text-xs text-muted-foreground hover:text-neon transition-colors ${
                          h.level === 3 ? "pl-3" : ""
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Related posts */}
              {related && related.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <h3 className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase mb-3">
                    {"// \u0421\u0412\u042A\u0420\u0417\u0410\u041D\u0418"}
                  </h3>
                  <div className="space-y-3">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/blog/${r.slug}`}
                        className="block group"
                      >
                        <h4 className="text-sm font-medium text-foreground group-hover:text-neon transition-colors line-clamp-2">
                          {r.title}
                        </h4>
                        {r.reading_time && (
                          <span className="text-[10px] text-muted-foreground/50">
                            {r.reading_time} {"\u043C\u0438\u043D"}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}

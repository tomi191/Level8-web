import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Clock, Calendar, ChevronRight, Tag } from "lucide-react";
import type { Database } from "@/types/database";
import { extractHeadings, addHeadingIds, slugifyHeading } from "@/lib/content-engine/utils/html-utils";
import { sanitizeBlogHtml } from "@/lib/sanitize";
import { SubscribeForm } from "@/components/blog/subscribe-form";
import { PushSubscribeButton } from "@/components/blog/push-subscribe-button";
import { ViberJoinCTA } from "@/components/blog/viber-join-cta";
import { FacebookEngagement } from "@/components/blog/facebook-engagement";

export const revalidate = 1800; // ISR: refresh every 30 min

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
    .select("title, meta_title, meta_description, image, excerpt, published_at, updated_at, category, keywords")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Not Found" };

  const rawTitle = post.meta_title || post.title;
  const title = rawTitle.replace(/\s*\|\s*Level\s*8\s*$/i, "");
  const description = post.meta_description || post.excerpt || "";

  return {
    title: `${title} | ЛЕВЕЛ 8`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "bg_BG",
      url: `https://level8.bg/blog/${slug}`,
      siteName: "ЛЕВЕЛ 8",
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : [],
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      section: post.category ?? undefined,
      tags: (post.keywords as string[] | null) ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.image ? [post.image] : [],
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
    .eq("published", true)
    .single();

  if (!post) notFound();

  // Process content: sanitize then inject heading IDs for TOC anchors
  const processedContent = post.content ? addHeadingIds(sanitizeBlogHtml(post.content)) : '';

  // Table of contents from headings
  const headings = post.content ? extractHeadings(post.content) : [];

  // Related posts (same category first, then any)
  let { data: related } = await supabase
    .from("blog_posts")
    .select("title, slug, image, excerpt, read_time")
    .eq("published", true)
    .eq("category", post.category || "")
    .neq("slug", slug)
    .limit(3);

  // Fallback: if not enough from same category, fill with any
  if (!related || related.length < 3) {
    const existingSlugs = [slug, ...(related || []).map(r => r.slug)];
    const { data: more } = await supabase
      .from("blog_posts")
      .select("title, slug, image, excerpt, read_time")
      .eq("published", true)
      .not("slug", "in", `(${existingSlugs.join(",")})`)
      .limit(3 - (related?.length || 0));
    related = [...(related || []), ...(more || [])];
  }

  // JSON-LD schemas
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.image || undefined,
    thumbnailUrl: post.image || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    wordCount: post.word_count,
    keywords: (post.keywords as string[] | null)?.join(", ") || undefined,
    articleSection: post.category || undefined,
    inLanguage: "bg",
    author: {
      "@type": "Organization",
      name: "ЛЕВЕЛ 8 ЕООД",
      url: "https://level8.bg",
    },
    publisher: {
      "@type": "Organization",
      name: "ЛЕВЕЛ 8 ЕООД",
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
      { "@type": "ListItem", position: 1, name: "Начало", item: "https://level8.bg/" },
      { "@type": "ListItem", position: 2, name: "Блог", item: "https://level8.bg/blog" },
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
          <Link href="/" className="hover:text-neon transition-colors">{"Начало"}</Link>
          <ChevronRight size={14} className="text-muted-foreground/40" />
          <Link href="/blog" className="hover:text-neon transition-colors">{"Блог"}</Link>
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
                {post.read_time && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {post.read_time} {"мин четене"}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {formatDate(post.published_at)}
                  </span>
                )}
                <FacebookEngagement slug={slug} />
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
            {post.image && (
              <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Audio player */}
            {post.audio_url && (
              <div className="mb-8 rounded-xl border border-neon/20 bg-neon/5 p-4 flex items-center gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-neon/70 mb-1">{"Слушай статията"}{post.audio_duration_sec ? ` · ${Math.ceil(post.audio_duration_sec / 60)} мин` : ""}</p>
                  <audio controls src={post.audio_url} className="w-full h-8" preload="none" />
                </div>
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


            {/* Author section */}
            <div className="mt-10 flex items-center gap-4 p-5 rounded-2xl border border-border bg-surface">
              <div className="shrink-0 w-14 h-14 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center">
                <span className="font-display text-lg font-bold text-neon">L8</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{"Екипът на Level 8"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {"Дигитална агенция от Варна. Изграждаме уебсайтове, AI решения и автоматизации за бизнеса."}
                </p>
                <Link href="/#about" className="text-xs text-neon hover:underline mt-1 inline-block">
                  {"Научи повече за нас"}
                </Link>
              </div>
            </div>

            {/* Updated date */}
            {post.updated_at && post.published_at && new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86400000 && (
              <p className="mt-4 text-xs text-muted-foreground/60 font-mono">
                {"Обновено на "}{formatDate(post.updated_at)}
              </p>
            )}

            {/* End-of-article CTA */}
            <div className="mt-10 rounded-2xl border border-neon/20 bg-neon/5 p-6 text-center">
              <p className="text-lg font-display font-bold text-foreground">
                {"Имате нужда от дигитално решение?"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {"Ние изграждаме уебсайтове, AI автоматизации и дигитални стратегии за бизнеса."}
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-lg bg-neon text-primary-foreground font-semibold text-sm hover:bg-neon/90 transition-colors"
              >
                {"Безплатна консултация"}
              </Link>
            </div>

            {/* Keywords */}
            {Array.isArray(post.keywords) && post.keywords.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {(post.keywords as string[]).map((kw) => (
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
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">
                {"Споделете:"}
              </span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://level8.bg/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-neon/30"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://level8.bg/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-neon/30"
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://level8.bg/blog/${slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-neon transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-neon/30"
              >
                X / Twitter
              </a>
              <PushSubscribeButton />
            </div>

            {/* Viber channel CTA */}
            <ViberJoinCTA />

            {/* Subscribe form */}
            <div className="mt-10">
              <SubscribeForm />
            </div>
          </div>

          {/* Sidebar — TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {headings.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <h2 className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase mb-3">
                    {"// СЪДЪРЖАНИЕ"}
                  </h2>
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
                  <h2 className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase mb-3">
                    {"// СВЪРЗАНИ"}
                  </h2>
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
                        {r.read_time && (
                          <span className="text-[10px] text-muted-foreground/50">
                            {r.read_time} {"мин"}
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  GitFork,
  Calendar,
  FileCode,
  Github,
  Download,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { FadeIn } from "@/components/animations/fade-in";
import {
  getSkillById,
  getAllSkillIds,
  getRelatedSkills,
  SKILL_CATEGORIES,
} from "@/lib/skills-data";
import { SkillMdRenderer } from "@/components/tools/skill-md-renderer";
import { SkillDetailActions } from "@/components/tools/skill-detail-actions";
import { TerminalWindow } from "@/components/tools/terminal-window";
import matter from "gray-matter";

/* ── Static generation ──────────────────────── */

export function generateStaticParams() {
  return getAllSkillIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) return {};

  const title = `${skill.name} \u2014 AI Agent Skill | LEVEL 8`;
  const description = skill.descriptionEn;

  return {
    title,
    description,
    alternates: { canonical: `/tools/skills/${id}` },
    openGraph: {
      title,
      description,
      url: `/tools/skills/${id}`,
      type: "article",
      locale: "bg_BG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ── Fetch SKILL.md from GitHub ─────────────── */

async function fetchSkillMd(
  url: string
): Promise<{ content: string; frontmatter: Record<string, string> } | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const raw = await res.text();
    const { data, content } = matter(raw);
    const frontmatter: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      frontmatter[k] = String(v);
    }
    return { content, frontmatter };
  } catch {
    return null;
  }
}

/* ── Format helpers ───────────────────────────── */

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ── Page component ─────────────────────────── */

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) notFound();

  const categoryInfo = SKILL_CATEGORIES.find((c) => c.id === skill.category);
  const related = getRelatedSkills(skill);
  const repoShort = skill.repo.replace("https://github.com/", "");
  const avatarUrl = `https://github.com/${skill.author}.png?size=80`;

  // Fetch SKILL.md if available
  const skillMd = skill.skillMdUrl
    ? await fetchSkillMd(skill.skillMdUrl)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: skill.name,
    description: skill.descriptionEn,
    author: { "@type": "Person", name: skill.author },
    codeRepository: skill.repo,
    programmingLanguage: "Markdown",
    url: `https://level8.bg/tools/skills/${skill.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="min-h-screen pt-24">
        {/* ── Breadcrumb (terminal style) ── */}
        <div className="container mx-auto px-4 pt-4">
          <FadeIn>
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground/50 font-mono">
              <span className="text-neon/40">$</span>
              <span className="text-syntax-from/60">pwd:</span>
              <Link
                href="/tools/skills"
                className="hover:text-neon transition-colors"
              >
                ~
              </Link>
              <span className="text-muted-foreground/25">/</span>
              {categoryInfo && (
                <>
                  <span className="text-muted-foreground/40">
                    {categoryInfo.labelEn.toLowerCase()}
                  </span>
                  <span className="text-muted-foreground/25">/</span>
                </>
              )}
              <span className="text-foreground">{skill.id}</span>
            </nav>
          </FadeIn>
        </div>

        {/* ── Main layout: 2 columns ── */}
        <section className="container mx-auto px-4 py-8">
          <FadeIn>
            <Link
              href="/tools/skills"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-neon transition-colors mb-6"
            >
              <ArrowLeft size={14} />
              <span className="font-mono">
                {"\u041D\u0430\u0437\u0430\u0434 \u043A\u044A\u043C \u0432\u0441\u0438\u0447\u043A\u0438"}
              </span>
            </Link>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Left column: Main content ── */}
            <div className="flex-1 min-w-0">
              {/* Title + description */}
              <FadeIn>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
                  {skill.name}
                </h1>
                <p className="text-muted-foreground/60 font-mono text-sm leading-relaxed mb-6">
                  <span className="text-syntax-comment/60">{"// "}</span>
                  {skill.descriptionEn}
                </p>
              </FadeIn>

              {/* Stats bar: $ git log --oneline --stat */}
              <FadeIn delay={0.05}>
                <div className="rounded-xl border border-border bg-surface mb-6">
                  <div className="px-4 py-2 border-b border-border/40 bg-white/[0.02]">
                    <span className="font-mono text-[11px] text-muted-foreground/40">
                      $ git log --oneline --stat
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-6 flex-wrap font-mono text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-gold/60 fill-current" />
                      <span className="text-muted-foreground/50">stars:</span>
                      <span className="text-foreground font-bold">
                        {skill.stars.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitFork size={14} className="text-muted-foreground/40" />
                      <span className="text-muted-foreground/50">forks:</span>
                      <span className="text-foreground">
                        {formatNumber(Math.round(skill.stars * 0.19))}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={14}
                        className="text-muted-foreground/40"
                      />
                      <span className="text-muted-foreground/50">
                        updated:
                      </span>
                      <span className="text-foreground">
                        {formatDate(skill.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* SKILL.md Content in TerminalWindow */}
              {skillMd && (
                <FadeIn delay={0.1}>
                  <TerminalWindow
                    title="SKILL.md"
                    badge="readonly"
                    badgeColor="blue"
                    className="mb-8"
                  >
                    <div className="p-5 md:p-6">
                      <SkillMdRenderer
                        content={skillMd.content}
                        frontmatter={skillMd.frontmatter}
                      />
                    </div>
                  </TerminalWindow>
                </FadeIn>
              )}

              {/* Fallback content if no SKILL.md */}
              {!skillMd && (
                <FadeIn delay={0.1}>
                  <TerminalWindow title="SKILL.md" className="mb-8">
                    <div className="py-10 text-center">
                      <FileCode
                        size={32}
                        className="text-muted-foreground/20 mx-auto mb-3"
                      />
                      <p className="text-sm text-muted-foreground/50 mb-2 font-mono">
                        {"\u0422\u043E\u0437\u0438 skill \u043D\u044F\u043C\u0430 \u043F\u0443\u0431\u043B\u0438\u0447\u0435\u043D SKILL.md \u0444\u0430\u0439\u043B."}
                      </p>
                      <a
                        href={skill.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-neon/70 hover:text-neon transition-colors"
                      >
                        {"\u0420\u0430\u0437\u0433\u043B\u0435\u0434\u0430\u0439\u0442\u0435 \u0432 GitHub"}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </TerminalWindow>
                </FadeIn>
              )}
            </div>

            {/* ── Right column: Sidebar ── */}
            <aside className="w-full lg:w-[350px] lg:max-w-[350px] shrink-0">
              <div className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
                {/* ─ package.json: author + repo + gh browse ─ */}
                <FadeIn delay={0.1}>
                  <TerminalWindow title="package.json" compact>
                    <div className="p-4 font-mono text-xs space-y-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={avatarUrl}
                          alt={skill.author}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full border border-border shrink-0"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <div className="text-muted-foreground/50">
                            <span className="text-syntax-from">
                              {'"author"'}
                            </span>
                            :{" "}
                            <span className="text-syntax-string">
                              {'"'}
                              {skill.author}
                              {'"'}
                            </span>
                          </div>
                          <div className="text-muted-foreground/50 truncate">
                            <span className="text-syntax-from">
                              {'"repository"'}
                            </span>
                            :{" "}
                            <a
                              href={skill.repo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-syntax-string hover:underline"
                            >
                              {'"'}
                              {repoShort}
                              {'"'}
                            </a>
                          </div>
                        </div>
                      </div>
                      <a
                        href={skill.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-border text-foreground rounded-lg hover:border-neon/30 hover:bg-white/[0.05] transition-colors"
                      >
                        <Github size={16} />
                        <span className="text-neon/60">$</span> gh browse
                      </a>
                    </div>
                  </TerminalWindow>
                </FadeIn>

                {/* ─ $ install --global ─ */}
                <FadeIn delay={0.15}>
                  <div className="rounded-xl border border-border bg-surface overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/40 bg-white/[0.02] flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted-foreground/40">
                        $ install --global
                      </span>
                      <a
                        href="https://skills.sh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-syntax-from/60 hover:text-neon transition-colors"
                      >
                        <ExternalLink size={10} />
                        skills.sh
                      </a>
                    </div>
                    <div className="p-4">
                      <SkillDetailActions repoShort={repoShort} />
                    </div>
                  </div>
                </FadeIn>

                {/* ─ $ download --local ─ */}
                <FadeIn delay={0.2}>
                  <div className="rounded-xl border border-border bg-surface overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/40 bg-white/[0.02]">
                      <span className="font-mono text-[11px] text-muted-foreground/40">
                        $ download --local
                      </span>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-3">
                      <a
                        href={`${skill.repo}/archive/refs/heads/main.zip`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-neon/10 border border-neon/20 text-neon rounded-lg font-medium hover:bg-neon/20 transition-colors"
                      >
                        <Download size={14} />
                        wget skill.zip
                      </a>
                      <p className="text-muted-foreground/30 text-[10px]">
                        <span className="text-gold/60">[HINT]</span> Download
                        the complete skill directory including SKILL.md and all
                        related files
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* ─ related-imports.ts ─ */}
                {related.length > 0 && (
                  <FadeIn delay={0.25}>
                    <div className="rounded-xl border border-border bg-surface overflow-hidden">
                      <div className="px-4 py-2 border-b border-border/40 bg-white/[0.02]">
                        <span className="font-mono text-[11px] text-muted-foreground/40">
                          related-imports.ts
                        </span>
                      </div>
                      <div className="p-4 font-mono text-xs space-y-2">
                        <div className="text-syntax-comment/60 mb-3">
                          {"// Related Skills"}
                        </div>
                        {related.slice(0, 10).map((s) => (
                          <Link
                            key={s.id}
                            href={`/tools/skills/${s.id}`}
                            className="block group"
                          >
                            <div className="border border-border/60 rounded-lg p-3 hover:border-neon/30 hover:bg-white/[0.02] transition-all">
                              <div className="flex items-start gap-2">
                                <Image
                                  src={`https://github.com/${s.author}.png?size=40`}
                                  alt={s.author}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-full border border-border shrink-0 mt-0.5"
                                  unoptimized
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="mb-0.5">
                                    <span className="text-syntax-from">
                                      import{" "}
                                    </span>
                                    <span className="text-foreground font-semibold group-hover:text-neon transition-colors truncate">
                                      {s.id}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground/40 truncate">
                                    <span className="text-syntax-from">
                                      from{" "}
                                    </span>
                                    <span className="text-syntax-string/70">
                                      {'"'}
                                      {s.author}
                                      {'"'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground/40 flex items-center gap-1 shrink-0">
                                  <Star
                                    size={10}
                                    className="text-gold/60 fill-current"
                                  />
                                  {formatNumber(s.stars)}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </FadeIn>
                )}
              </div>
            </aside>
          </div>
        </section>

        <CircuitDivider />
      </main>

      <Footer />
    </>
  );
}

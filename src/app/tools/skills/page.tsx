import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CircuitDivider } from "@/components/animations/circuit-divider";
import { FadeIn } from "@/components/animations/fade-in";
import { CtaButton } from "@/components/shared/cta-button";
import { SkillsExplorer } from "@/components/tools/skills-explorer";
import { InstallSection } from "@/components/tools/install-section";
import { TerminalWindow } from "@/components/tools/terminal-window";
import {
  SKILLS,
  SKILL_CATEGORIES,
  SKILLS_FAQ,
} from "@/lib/skills-data";

export const metadata: Metadata = {
  title: "AI Agent Skills \u2014 \u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F | LEVEL 8",
  description:
    "\u041A\u0443\u0440\u0438\u0440\u0430\u043D\u0430 \u043A\u043E\u043B\u0435\u043A\u0446\u0438\u044F \u043E\u0442 " +
    SKILLS.length +
    " AI agent skills \u0437\u0430 Claude Code, Codex CLI \u0438 ChatGPT. \u041E\u0442\u043A\u0440\u0438\u0439\u0442\u0435, \u043D\u0430\u0443\u0447\u0435\u0442\u0435 \u0438 \u0438\u043D\u0441\u0442\u0430\u043B\u0438\u0440\u0430\u0439\u0442\u0435 \u0443\u043C\u0435\u043D\u0438\u044F \u0437\u0430 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430, \u0442\u0435\u0441\u0442\u0432\u0430\u043D\u0435, \u0434\u0438\u0437\u0430\u0439\u043D \u0438 \u043E\u0449\u0435.",
  alternates: { canonical: "/tools/skills" },
  openGraph: {
    title: "AI Agent Skills \u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F | LEVEL 8",
    description:
      "\u041A\u0443\u0440\u0438\u0440\u0430\u043D\u0430 \u043A\u043E\u043B\u0435\u043A\u0446\u0438\u044F \u043E\u0442 AI agent skills \u0437\u0430 Claude Code, Codex CLI \u0438 ChatGPT.",
    url: "/tools/skills",
    type: "website",
    locale: "bg_BG",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent Skills \u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F | LEVEL 8",
    description:
      "\u041A\u0443\u0440\u0438\u0440\u0430\u043D\u0430 \u043A\u043E\u043B\u0435\u043A\u0446\u0438\u044F \u043E\u0442 AI agent skills \u0437\u0430 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u0446\u0438.",
  },
};

export default function SkillsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Agent Skills \u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F",
    description:
      "\u041A\u0443\u0440\u0438\u0440\u0430\u043D\u0430 \u043A\u043E\u043B\u0435\u043A\u0446\u0438\u044F \u043E\u0442 AI agent skills \u0437\u0430 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u0446\u0438.",
    url: "https://level8.bg/tools/skills",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: SKILLS.length,
      itemListElement: SKILLS.map((skill, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: skill.name,
        description: skill.descriptionEn,
        url: skill.repo,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="min-h-screen pt-24">
        {/* ── Hero ── */}
        <section className="container mx-auto px-4 py-12">
          <FadeIn>
            <TerminalWindow title="skills.marketplace" className="max-w-3xl mx-auto">
              <div className="p-6 md:p-8 font-mono">
                <p className="text-xs text-syntax-comment mb-4">{"// main.ts"}</p>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                  <span className="text-neon">{">"}</span> Agent Skills{" "}
                  <span className="text-neon">Marketplace</span>
                  <span className="animate-pulse text-neon ml-1">|</span>
                </h1>

                {/* Stats as code */}
                <div className="rounded-lg border border-border bg-black/30 p-4 inline-block">
                  <div className="text-sm">
                    <span className="text-syntax-keyword">const</span>{" "}
                    <span className="text-foreground">skills</span>{" "}
                    <span className="text-muted-foreground/40">=</span>{" "}
                    <span className="text-neon text-xl font-bold">
                      {SKILLS.length}
                    </span>
                    <span className="text-muted-foreground/40"> ;</span>
                  </div>
                  <p className="text-xs text-syntax-comment mt-1.5">
                    {"// Curated for Claude Code, Codex CLI & ChatGPT"}
                  </p>
                  <p className="text-xs text-syntax-comment">
                    {"// "}
                    {SKILL_CATEGORIES.length}
                    {" categories \u2022 open SKILL.md ecosystem"}
                  </p>
                </div>
              </div>
            </TerminalWindow>
          </FadeIn>
        </section>

        <CircuitDivider />

        {/* ── Skills Explorer ── */}
        <section className="container mx-auto px-4 py-12">
          <SkillsExplorer />
        </section>

        <CircuitDivider />

        {/* ── Install Guide ── */}
        <section className="container mx-auto px-4 py-12">
          <FadeIn>
            <InstallSection />
          </FadeIn>
        </section>

        <CircuitDivider />

        {/* ── FAQ (JSDoc comment style) ── */}
        <section className="container mx-auto px-4 py-12">
          <FadeIn>
            <TerminalWindow
              title="FAQ.md"
              badge={`${SKILLS_FAQ.length} questions`}
              badgeColor="green"
              className="max-w-3xl mx-auto"
            >
              <div className="divide-y divide-border/30">
                {SKILLS_FAQ.map((item, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[11px] text-neon/30 shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-sm font-bold text-foreground mb-2">
                          <span className="text-neon/60">Q:</span>{" "}
                          {item.question}
                        </h3>
                        <div className="font-mono text-xs text-muted-foreground/50 leading-relaxed">
                          <span className="text-syntax-comment/60">
                            {"/** "}
                          </span>
                          {item.answer}
                          <span className="text-syntax-comment/60">
                            {" */"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TerminalWindow>
          </FadeIn>
        </section>

        <CircuitDivider />

        {/* ── CTA ── */}
        <section className="container mx-auto px-4 py-20 text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {"Нуждаете се от "}
              <span className="text-neon">AI решение</span>?
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Ние интегрираме AI агенти и автоматизации в бизнес процесите на
              нашите клиенти. Свържете се за безплатна консултация.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CtaButton href="/#contact" variant="neon">
                Безплатна консултация
              </CtaButton>
              <CtaButton href="/#services" variant="outline">
                Нашите услуги
              </CtaButton>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </>
  );
}

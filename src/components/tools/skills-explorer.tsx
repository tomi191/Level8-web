"use client";

import { useState, useMemo } from "react";
import { Search, X, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILLS, SKILL_CATEGORIES } from "@/lib/skills-data";
import type { SkillCategory } from "@/lib/skills-data";
import { SkillCard } from "./skill-card";
import { TerminalWindow } from "./terminal-window";

type SortMode = "stars" | "recent";

const PER_PAGE_OPTIONS = [12, 24, 48] as const;
const TOP_LIMIT = 5000;

export function SkillsExplorer() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    SkillCategory | "all"
  >("all");
  const [sortMode, setSortMode] = useState<SortMode>("stars");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(12);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SKILLS.length };
    for (const s of SKILLS) {
      counts[s.category] = (counts[s.category] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    let result = [...SKILLS];

    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.descriptionEn.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.author.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }

    if (sortMode === "stars") {
      result.sort((a, b) => b.stars - a.stars);
    } else {
      result.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    }

    // Limit to top N for browsing
    if (!query.trim()) {
      result = result.slice(0, TOP_LIMIT);
    }

    return result;
  }, [query, activeCategory, sortMode]);

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
    // Scroll to top of explorer
    document.getElementById("skills-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div id="skills-explorer" className="space-y-5 scroll-mt-24">
      {/* ── skills --list header ── */}
      <TerminalWindow title="skills --list" badge="ready">
        <div className="px-5 py-5">
          <h2 className="font-mono text-xl md:text-2xl font-bold text-foreground mb-3">
            <span className="text-neon">{">"}</span> Browse Agent Skills
          </h2>
          <div className="font-mono text-sm text-muted-foreground/50 flex items-center gap-2 flex-wrap">
            <span className="text-neon/50">$</span>
            <span>count:</span>
            <span className="text-neon font-bold">{SKILLS.length}</span>
            <span>skills available</span>
            <span className="text-muted-foreground/50">--top={TOP_LIMIT}</span>
            <span className="text-muted-foreground/50">--sort</span>
            {/* Sort pills */}
            <div className="inline-flex gap-1 ml-1">
              <button
                onClick={() => { setSortMode("stars"); setPage(1); }}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono transition-all",
                  sortMode === "stars"
                    ? "bg-neon/10 border border-neon/30 text-neon"
                    : "bg-white/[0.03] border border-border text-muted-foreground/50 hover:text-foreground"
                )}
              >
                <Star size={10} />
                stars
              </button>
              <button
                onClick={() => { setSortMode("recent"); setPage(1); }}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono transition-all",
                  sortMode === "recent"
                    ? "bg-neon/10 border border-neon/30 text-neon"
                    : "bg-white/[0.03] border border-border text-muted-foreground/50 hover:text-foreground"
                )}
              >
                <Clock size={10} />
                recent
              </button>
            </div>
          </div>
          {!query.trim() && SKILLS.length > TOP_LIMIT && (
            <p className="font-mono text-[11px] text-muted-foreground/55 mt-2">
              Browsing is limited to the top {TOP_LIMIT} skills (out of{" "}
              {SKILLS.length.toLocaleString()}). Use search to find more.
            </p>
          )}
        </div>
      </TerminalWindow>

      {/* ── Terminal search bar ── */}
      <TerminalWindow title="search --ai">
        <div className="flex flex-col">
          <div className="px-4 py-0.5 flex items-center justify-end">
            <span className="font-mono text-[10px] text-muted-foreground/50">
              Type to filter, or press Enter for search.
            </span>
          </div>
          <div className="px-4 py-2.5 flex items-center gap-2">
            <span className="font-mono text-sm text-neon/50 shrink-0">$</span>
            <span className="font-mono text-sm text-syntax-from shrink-0">
              find
            </span>
            <Search size={14} className="text-muted-foreground/55 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={`Search ${SKILLS.length.toLocaleString()} skills with AI: try 'skills about testing', 'data analysis related skills'...`}
              className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setPage(1); }}
                className="text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            )}
            <button className="px-2.5 py-1 rounded-lg border border-border bg-white/[0.03] font-mono text-[11px] text-muted-foreground/55 hover:border-neon/30 hover:text-neon transition-colors shrink-0 flex items-center gap-1.5">
              <Search size={10} />
              execute
            </button>
          </div>
        </div>
      </TerminalWindow>

      {/* ── Category filter pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <span className="font-mono text-xs text-neon/60 shrink-0">$</span>
        <span className="font-mono text-xs text-syntax-from/80 shrink-0 mr-1">
          filter
        </span>
        <button
          onClick={() => { setActiveCategory("all"); setPage(1); }}
          className={cn(
            "px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all shrink-0",
            activeCategory === "all"
              ? "bg-neon/10 border border-neon/30 text-neon"
              : "bg-white/[0.02] border border-border text-muted-foreground/55 hover:text-foreground"
          )}
        >
          all{" "}
          <span className="text-[10px] opacity-50">{categoryCounts.all}</span>
        </button>
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setPage(1); }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all shrink-0",
              activeCategory === cat.id
                ? "bg-neon/10 border border-neon/30 text-neon"
                : "bg-white/[0.02] border border-border text-muted-foreground/55 hover:text-foreground"
            )}
          >
            {cat.labelEn.toLowerCase()}{" "}
            <span className="text-[10px] opacity-50">
              {categoryCounts[cat.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* ── Skills grid ── */}
      {paged.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <TerminalWindow title="error">
          <div className="py-12 text-center font-mono">
            <p className="text-sm text-muted-foreground/55">
              $ skills search &quot;{query}&quot;
            </p>
            <p className="text-sm text-muted-foreground/55 mt-1">
              0 results found
            </p>
            <p className="text-xs text-muted-foreground/55 mt-3">
              {"\u041E\u043F\u0438\u0442\u0430\u0439\u0442\u0435 \u0441 \u0440\u0430\u0437\u043B\u0438\u0447\u043D\u0430 \u043A\u043B\u044E\u0447\u043E\u0432\u0430 \u0434\u0443\u043C\u0430 \u0438\u043B\u0438 \u043F\u0440\u0435\u043C\u0430\u0445\u043D\u0435\u0442\u0435 \u0444\u0438\u043B\u0442\u044A\u0440\u0430."}
            </p>
          </div>
        </TerminalWindow>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <nav className="flex items-center gap-1 font-mono text-xs">
            <span className="text-muted-foreground/50 mr-2">
              Shortcut: {"\u2190"} / {"\u2192"}
            </span>
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                safePage <= 1
                  ? "border-border/30 text-muted-foreground/30 cursor-not-allowed"
                  : "border-border text-muted-foreground/50 hover:border-neon/30 hover:text-neon"
              )}
            >
              <ChevronLeft size={14} />
            </button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) {
                p = i + 1;
              } else if (safePage <= 3) {
                p = i + 1;
              } else if (safePage >= totalPages - 2) {
                p = totalPages - 4 + i;
              } else {
                p = safePage - 2 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={cn(
                    "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                    p === safePage
                      ? "border-neon/40 bg-neon/10 text-neon"
                      : "border-border text-muted-foreground/55 hover:border-neon/20 hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center transition-colors",
                safePage >= totalPages
                  ? "border-border/30 text-muted-foreground/30 cursor-not-allowed"
                  : "border-border text-muted-foreground/50 hover:border-neon/30 hover:text-neon"
              )}
            >
              <ChevronRight size={14} />
            </button>
          </nav>

          {/* Per page selector */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/50">
            <span className="text-neon/60">$</span>
            <span>show</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className="bg-white/[0.03] border border-border rounded-lg px-2 py-1 text-foreground font-mono text-[11px] focus:outline-none focus:border-neon/30"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        </div>
      )}
    </div>
  );
}

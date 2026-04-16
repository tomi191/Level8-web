"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TOCItem {
  id: string;
  label: string;
  number: string;
}

interface CaseStudyTOCProps {
  items: TOCItem[];
}

export function CaseStudyTOC({ items }: CaseStudyTOCProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(pct);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <aside
      className="sticky top-36 hidden xl:block"
      aria-label="Съдържание на страницата"
    >
      <div className="rounded-xl border border-border bg-surface/80 backdrop-blur p-5">
        <div className="flex items-center gap-2 font-mono-terminal text-[10px] text-muted-foreground/70 uppercase tracking-[0.2em] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          Съдържание
        </div>

        <nav>
          <ul className="space-y-2">
            {items.map((item) => {
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`#${item.id}`}
                    className={`block text-xs font-mono-terminal transition-colors leading-tight py-1 ${
                      active
                        ? "text-neon"
                        : "text-muted-foreground/70 hover:text-foreground"
                    }`}
                  >
                    <span className="inline-block w-7 text-muted-foreground/50">
                      {item.number}
                    </span>
                    <span>{active ? "▸ " : "  "}{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Progress bar */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono-terminal text-[10px] text-muted-foreground/60 uppercase tracking-wider">
              прогрес
            </span>
            <span className="font-mono-terminal text-[10px] text-neon/70">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-0.5 bg-border/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-neon transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Sticky CTA at bottom */}
        <Link
          href="/#contact"
          className="mt-5 flex items-center justify-between gap-2 rounded-lg border border-neon/30 bg-neon/5 hover:bg-neon/10 transition-colors px-3 py-2 group"
        >
          <span className="font-mono-terminal text-[11px] text-neon">
            Заяви консултация
          </span>
          <ArrowRight
            size={12}
            className="text-neon group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>
    </aside>
  );
}

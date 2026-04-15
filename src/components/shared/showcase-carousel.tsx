"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ShowcasePair {
  desktop: { src: string; alt: string };
  mobile?: { src: string; alt: string };
  caption: string;
  path: string;
}

interface ShowcaseCarouselProps {
  pairs: ShowcasePair[];
}

export function ShowcaseCarousel({ pairs }: ShowcaseCarouselProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const total = pairs.length;
  const go = (next: number) => setIndex(((next % total) + total) % total);
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta > 0) prev();
      else next();
    }
    touchStartX.current = null;
  };

  const active = pairs[index];

  return (
    <div className="relative">
      {/* File path header — reflects active slide */}
      <div className="flex items-center justify-between gap-4 mb-4 text-[11px] font-mono-terminal">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-neon/40">$</span>
          <span className="text-muted-foreground truncate">
            open ~/screens/{active.path}
          </span>
        </div>
        <span className="text-muted-foreground/50 shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Slide viewport */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-black/30"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Screenshots showcase"
      >
        {/* Corner brackets */}
        <span aria-hidden="true" className="absolute top-2 left-2 w-4 h-4 border-t border-l border-neon/60 z-20" />
        <span aria-hidden="true" className="absolute top-2 right-2 w-4 h-4 border-t border-r border-neon/60 z-20" />
        <span aria-hidden="true" className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-neon/60 z-20" />
        <span aria-hidden="true" className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-neon/60 z-20" />

        {/* Slides track */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {pairs.map((pair, i) => (
            <div
              key={pair.desktop.src}
              className="min-w-full relative"
              aria-hidden={i !== index}
            >
              {/* Desktop screenshot — native aspect */}
              <div className="relative aspect-[1440/900] bg-black">
                <Image
                  src={pair.desktop.src}
                  alt={pair.desktop.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover object-top"
                  priority={i === 0}
                />
              </div>

              {/* Phone frame overlay — bottom-right, real device chrome */}
              {pair.mobile && (
                <div className="absolute bottom-[3%] right-[3%] w-[18%] min-w-[90px] max-w-[150px] hidden sm:block">
                  <PhoneFrame>
                    <Image
                      src={pair.mobile.src}
                      alt={pair.mobile.alt}
                      width={390}
                      height={844}
                      className="w-full h-auto block"
                      sizes="(max-width: 1024px) 20vw, 150px"
                    />
                  </PhoneFrame>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Предишен"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-border hover:border-neon/50 hover:bg-black/90 transition-all text-foreground hover:text-neon"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следващ"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 backdrop-blur border border-border hover:border-neon/50 hover:bg-black/90 transition-all text-foreground hover:text-neon"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Mobile-only: phone preview rendered below on narrow viewports */}
      {active.mobile && (
        <div className="sm:hidden mt-5 flex justify-center">
          <div className="w-[180px]">
            <PhoneFrame>
              <Image
                src={active.mobile.src}
                alt={active.mobile.alt}
                width={390}
                height={844}
                className="w-full h-auto block"
                sizes="180px"
              />
            </PhoneFrame>
          </div>
        </div>
      )}

      {/* Footer: caption + pagination dots + keyboard hint */}
      <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="w-8 h-px bg-neon/40" aria-hidden="true" />
          <span className="font-mono-terminal">{active.caption}</span>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" role="tablist">
              {pairs.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Слайд ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === index ? "w-8 bg-neon" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
            <span className="hidden md:inline font-mono-terminal text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              ← → keys / swipe
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Phone frame: real device chrome ─────────────────────────────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[20px] bg-neutral-950 p-[3px] shadow-2xl"
      style={{
        boxShadow:
          "0 25px 50px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 2px rgba(0,0,0,1), 0 0 20px rgba(57, 255, 20, 0.15)",
      }}
    >
      {/* Screen */}
      <div className="relative rounded-[17px] overflow-hidden bg-black">
        {children}

        {/* Dynamic island (top) */}
        <div
          aria-hidden="true"
          className="absolute top-[3%] left-1/2 -translate-x-1/2 h-[4%] w-[30%] bg-black rounded-full z-10"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
        />

        {/* Home bar (bottom) */}
        <div
          aria-hidden="true"
          className="absolute bottom-[1.5%] left-1/2 -translate-x-1/2 h-[0.4%] min-h-[2px] w-[30%] bg-white/40 rounded-full z-10"
        />
      </div>
    </div>
  );
}

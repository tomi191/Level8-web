"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface LiveSlide {
  path: string;
  label: string;
  fallbackDesktop?: string;
  fallbackMobile?: string;
}

interface ShowcaseLiveProps {
  liveBase: string;
  slides: LiveSlide[];
}

export function ShowcaseLive({ liveBase, slides }: ShowcaseLiveProps) {
  const [index, setIndex] = useState(0);
  const [desktopLoaded, setDesktopLoaded] = useState(false);
  const [mobileLoaded, setMobileLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;
  const go = (next: number) => {
    setIndex(((next % total) + total) % total);
    setDesktopLoaded(false);
    setMobileLoaded(false);
  };
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
    if (Math.abs(delta) > 50) (delta > 0 ? prev() : next());
    touchStartX.current = null;
  };

  const active = slides[index];
  const url = liveBase.replace(/\/$/, "") + active.path;

  return (
    <div>
      {/* Header: path + counter + external link */}
      <div className="flex items-center justify-between gap-4 mb-5 text-[11px] font-mono-terminal flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-neon/40">⦿</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            <span className="text-neon/80 uppercase tracking-[0.2em] text-[9px]">
              live
            </span>
          </span>
          <span className="text-muted-foreground/40">·</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-neon transition-colors inline-flex items-center gap-1 truncate"
          >
            {url.replace(/^https?:\/\//, "")}
            <ExternalLink size={10} className="shrink-0" />
          </a>
        </div>
        <span className="text-muted-foreground/50 shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Device stage — frames stationary, iframes change src */}
      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Live preview carousel"
      >
        {/* Monitor (desktop) */}
        <div className="relative mx-auto" style={{ maxWidth: "900px" }}>
          <MonitorFrame>
            {/* Loading indicator */}
            {!desktopLoaded && active.fallbackDesktop && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={active.fallbackDesktop}
                  alt=""
                  fill
                  className="object-cover object-top opacity-60"
                  sizes="900px"
                  priority={index === 0}
                />
              </div>
            )}
            <iframe
              key={`desktop-${index}`}
              src={url}
              title={`Desktop preview: ${active.label}`}
              className="absolute inset-0 w-full h-full bg-black"
              loading={index === 0 ? "eager" : "lazy"}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setDesktopLoaded(true)}
            />
          </MonitorFrame>

          {/* Phone (mobile) — overlay bottom-right */}
          <div className="absolute bottom-[8%] right-[-2%] sm:right-[2%] w-[26%] min-w-[100px] max-w-[180px] hidden sm:block z-10">
            <PhoneFrame>
              {!mobileLoaded && active.fallbackMobile && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={active.fallbackMobile}
                    alt=""
                    fill
                    className="object-cover object-top opacity-60"
                    sizes="180px"
                  />
                </div>
              )}
              <iframe
                key={`mobile-${index}`}
                src={url}
                title={`Mobile preview: ${active.label}`}
                className="absolute inset-0 w-full h-full bg-black"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setMobileLoaded(true)}
                style={{ transform: "scale(0.55)", transformOrigin: "top left", width: "181.8%", height: "181.8%" }}
              />
            </PhoneFrame>
          </div>
        </div>

        {/* Mobile phone fallback under monitor on small viewports */}
        <div className="sm:hidden mt-6 flex justify-center">
          <div className="w-[200px]">
            <PhoneFrame>
              {!mobileLoaded && active.fallbackMobile && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={active.fallbackMobile}
                    alt=""
                    fill
                    className="object-cover object-top opacity-60"
                    sizes="200px"
                  />
                </div>
              )}
              <iframe
                key={`mobile-xs-${index}`}
                src={url}
                title={`Mobile preview: ${active.label}`}
                className="absolute inset-0 w-full h-full bg-black"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                onLoad={() => setMobileLoaded(true)}
              />
            </PhoneFrame>
          </div>
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Предишен"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 backdrop-blur border border-border hover:border-neon/50 hover:bg-black transition-all text-foreground hover:text-neon -translate-x-1/2"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следващ"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 backdrop-blur border border-border hover:border-neon/50 hover:bg-black transition-all text-foreground hover:text-neon translate-x-1/2"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Footer: label + pagination + hint */}
      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="w-8 h-px bg-neon/40" aria-hidden="true" />
          <span className="font-mono-terminal">{active.label}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" role="tablist">
            {slides.map((s, i) => (
              <button
                key={s.path}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Слайд ${i + 1}: ${s.label}`}
                onClick={() => go(i)}
                className={`h-1 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-neon"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          <span className="hidden md:inline font-mono-terminal text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            ← → / swipe · scroll inside
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Monitor frame: modern desktop display with thin bezel + stand ──────────
function MonitorFrame({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Monitor body */}
      <div
        className="relative bg-neutral-900 p-1.5 md:p-2 pb-3 md:pb-4 rounded-t-[14px] rounded-b-[8px] border border-neutral-800"
        style={{
          boxShadow:
            "0 30px 60px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 40px rgba(57, 255, 20, 0.08)",
        }}
      >
        {/* Screen area */}
        <div className="relative rounded-[6px] overflow-hidden bg-black aspect-[16/10]">
          {children}

          {/* Corner brackets — Level 8 signature */}
          <span aria-hidden="true" className="absolute top-1 left-1 w-3 h-3 border-t border-l border-neon/40 z-30" />
          <span aria-hidden="true" className="absolute top-1 right-1 w-3 h-3 border-t border-r border-neon/40 z-30" />
          <span aria-hidden="true" className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-neon/40 z-30" />
          <span aria-hidden="true" className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-neon/40 z-30" />
        </div>

        {/* Brand label + LED */}
        <div className="flex items-center justify-center gap-1.5 mt-1.5 md:mt-2">
          <span className="w-1 h-1 rounded-full bg-neon/60" />
          <span className="font-mono-terminal text-[8px] text-neutral-700 uppercase tracking-[0.3em]">
            level8
          </span>
        </div>
      </div>

      {/* Stand neck */}
      <div
        className="mx-auto bg-gradient-to-b from-neutral-900 to-neutral-800"
        style={{ width: "14%", height: "18px" }}
      />
      {/* Stand base */}
      <div
        className="mx-auto bg-neutral-900 rounded-b-xl"
        style={{ width: "30%", height: "6px", boxShadow: "0 4px 12px rgba(0,0,0,0.6)" }}
      />
    </div>
  );
}

// ── Phone frame: modern smartphone с dynamic island + home bar ──────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[22px] bg-neutral-950 p-[3px]"
      style={{
        boxShadow:
          "0 25px 50px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 0 20px rgba(57, 255, 20, 0.2)",
      }}
    >
      {/* Screen */}
      <div className="relative rounded-[19px] overflow-hidden bg-black aspect-[390/844]">
        {children}

        {/* Dynamic island */}
        <div
          aria-hidden="true"
          className="absolute top-[2.5%] left-1/2 -translate-x-1/2 h-[3.5%] w-[32%] bg-black rounded-full z-20"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
        />

        {/* Home bar */}
        <div
          aria-hidden="true"
          className="absolute bottom-[1.2%] left-1/2 -translate-x-1/2 h-[3px] w-[30%] bg-white/40 rounded-full z-20"
        />
      </div>
    </div>
  );
}

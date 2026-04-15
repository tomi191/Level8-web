"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play } from "lucide-react";

// ─── Auto-scroll hook ──────────────────────────────────────────────
function useAutoScroll(
  ref: React.RefObject<HTMLDivElement | null>,
  active: boolean,
  playing: boolean,
  speed: number
) {
  useEffect(() => {
    if (!active || !playing || !ref.current) return;
    const el = ref.current;
    let raf = 0;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (!paused && el.isConnected) {
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 0) {
          raf = requestAnimationFrame(tick);
          return;
        }
        if (el.scrollTop >= max - 1) {
          paused = true;
          // Pause at bottom, then smooth-scroll back to top, then pause, then resume
          setTimeout(() => {
            el.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              paused = false;
            }, 1800);
          }, 1500);
        } else {
          el.scrollTop += speed;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const pauseAndResume = () => {
      paused = true;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, 2500);
    };

    // Start from top
    el.scrollTop = 0;
    raf = requestAnimationFrame(tick);

    el.addEventListener("wheel", pauseAndResume, { passive: true });
    el.addEventListener("touchmove", pauseAndResume, { passive: true });
    el.addEventListener("mouseenter", pauseAndResume);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      el.removeEventListener("wheel", pauseAndResume);
      el.removeEventListener("touchmove", pauseAndResume);
      el.removeEventListener("mouseenter", pauseAndResume);
    };
  }, [active, playing, ref, speed]);
}

// Slide wrapper that owns its auto-scroll ref
function AutoScrollSlide({
  active,
  playing,
  src,
  alt,
  speed,
  scrollbarClass,
  loading,
}: {
  active: boolean;
  playing: boolean;
  src?: string;
  alt: string;
  speed: number;
  scrollbarClass: string;
  loading?: "eager" | "lazy";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useAutoScroll(ref, active, playing, speed);

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-y-auto overflow-x-hidden transition-opacity duration-700 ease-out ${scrollbarClass} ${
        active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
      }`}
      aria-hidden={!active}
      style={{ scrollBehavior: "auto" }}
    >
      {src && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className="w-full h-auto block"
          loading={loading ?? "lazy"}
        />
      )}
    </div>
  );
}

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

const DESKTOP_SPEED = 2.2; // px per frame
const MOBILE_SPEED = 1.6;

export function ShowcaseLive({ liveBase, slides }: ShowcaseLiveProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;
  const go = (n: number) => setIndex(((n % total) + total) % total);
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
  const liveUrl = liveBase.replace(/\/$/, "") + active.path;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 text-[11px] font-mono-terminal flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-neon/40">⦿</span>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-neon transition-colors inline-flex items-center gap-1 truncate"
          >
            {liveUrl.replace(/^https?:\/\//, "")}
            <ExternalLink size={10} className="shrink-0" />
          </a>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Пауза на автоматичния скрол" : "Стартирай автоматичния скрол"}
            className="inline-flex items-center gap-1.5 rounded border border-border hover:border-neon/50 bg-surface/50 px-2 py-1 text-muted-foreground hover:text-neon transition-colors"
          >
            {playing ? <Pause size={10} /> : <Play size={10} />}
            <span className="uppercase tracking-wider text-[9px]">
              {playing ? "auto" : "paused"}
            </span>
          </button>
          <span className="text-muted-foreground/50 tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Stage */}
      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="region"
        aria-roledescription="carousel"
        aria-label="Device showcase"
      >
        {/* Realistic desktop monitor */}
        <div className="relative mx-auto" style={{ maxWidth: "920px" }}>
          <RealisticMonitor>
            <div className="absolute inset-0">
              {slides.map((s, i) => (
                <AutoScrollSlide
                  key={s.path}
                  active={i === index}
                  playing={playing}
                  src={s.fallbackDesktop}
                  alt={s.label}
                  speed={DESKTOP_SPEED}
                  scrollbarClass="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neon/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neon/60"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ))}
            </div>
          </RealisticMonitor>

          {/* Phone overlay — picture-in-picture */}
          <div className="absolute bottom-[14%] right-[-3%] sm:right-[2%] w-[26%] min-w-[110px] max-w-[190px] hidden sm:block z-20">
            <PhoneFrame>
              <div className="absolute inset-0">
                {slides.map((s, i) => (
                  <AutoScrollSlide
                    key={s.path}
                    active={i === index}
                    playing={playing}
                    src={s.fallbackMobile}
                    alt={s.label}
                    speed={MOBILE_SPEED}
                    scrollbarClass="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neon/30 [&::-webkit-scrollbar-thumb]:rounded-full"
                  />
                ))}
              </div>
            </PhoneFrame>
          </div>
        </div>

        {/* Mobile-only phone under the monitor */}
        <div className="sm:hidden mt-8 flex justify-center">
          <div className="w-[210px]">
            <PhoneFrame>
              <div className="absolute inset-0">
                {slides.map((s, i) => (
                  <AutoScrollSlide
                    key={s.path}
                    active={i === index}
                    playing={playing}
                    src={s.fallbackMobile}
                    alt={s.label}
                    speed={MOBILE_SPEED}
                    scrollbarClass="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neon/30 [&::-webkit-scrollbar-thumb]:rounded-full"
                  />
                ))}
              </div>
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
              className="absolute left-0 top-1/3 -translate-y-1/2 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-black/80 backdrop-blur border border-border hover:border-neon/60 hover:bg-black hover:shadow-[0_0_20px_rgba(57,255,20,0.25)] transition-all text-foreground hover:text-neon -translate-x-1/2"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Следващ"
              className="absolute right-0 top-1/3 -translate-y-1/2 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-black/80 backdrop-blur border border-border hover:border-neon/60 hover:bg-black hover:shadow-[0_0_20px_rgba(57,255,20,0.25)] transition-all text-foreground hover:text-neon translate-x-1/2"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="w-8 h-px bg-neon/40" aria-hidden="true" />
          <span className="font-mono-terminal">{active.label}</span>
          <span className="hidden md:inline-flex items-center gap-1 text-muted-foreground/40 text-[10px] uppercase tracking-wider font-mono-terminal">
            {playing ? "auto-scroll · hover to pause" : "scroll inside"}
          </span>
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
                    ? "w-8 bg-neon shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
          <span className="hidden md:inline font-mono-terminal text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            ← → / swipe
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Realistic 3D monitor — multi-layer shadows, gradient bezel, screen glare,
// proper stand with neck + base + floor shadow. Subtle perspective tilt.
// ═══════════════════════════════════════════════════════════════════════════
function RealisticMonitor({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative"
      style={{
        perspective: "2400px",
        perspectiveOrigin: "50% 0%",
      }}
    >
      <div
        className="relative"
        style={{
          transform: "rotateX(1.5deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer bezel */}
        <div
          className="relative rounded-t-[20px] rounded-b-[14px] p-[6px] md:p-[8px]"
          style={{
            background:
              "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 45%, #141414 55%, #1c1c1c 100%)",
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.12)",
              "inset 0 -1px 0 rgba(255,255,255,0.03)",
              "inset 1px 0 0 rgba(255,255,255,0.04)",
              "inset -1px 0 0 rgba(255,255,255,0.04)",
              "0 2px 4px rgba(0,0,0,0.35)",
              "0 16px 32px -8px rgba(0,0,0,0.55)",
              "0 40px 80px -12px rgba(0,0,0,0.75)",
              "0 80px 140px -20px rgba(0,0,0,0.9)",
              "0 0 60px rgba(57, 255, 20, 0.08)",
            ].join(","),
          }}
        >
          {/* Screen */}
          <div
            className="relative rounded-[10px] overflow-hidden bg-black aspect-[16/10]"
            style={{
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 2px 8px rgba(0,0,0,0.9)",
            }}
          >
            {children}

            {/* Glare */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-40"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 30%, transparent 55%)",
                mixBlendMode: "screen",
              }}
            />

            {/* Vignette */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-40"
              style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }}
            />

            {/* Corner brackets */}
            <span aria-hidden="true" className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-neon/40 z-40 pointer-events-none" />
            <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-neon/40 z-40 pointer-events-none" />
            <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-neon/40 z-40 pointer-events-none" />
            <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-neon/40 z-40 pointer-events-none" />
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 pb-1">
            <span
              className="w-[3px] h-[3px] rounded-full bg-neon"
              style={{ boxShadow: "0 0 4px rgba(57, 255, 20, 0.8)" }}
            />
            <span className="font-mono-terminal text-[8px] text-neutral-700 uppercase tracking-[0.35em]">
              level8
            </span>
          </div>
        </div>
      </div>

      {/* Stand */}
      <div
        className="mx-auto relative"
        style={{
          width: "11%",
          height: "22px",
          background:
            "linear-gradient(180deg, #1a1a1a 0%, #222222 50%, #1a1a1a 100%)",
          boxShadow:
            "inset 1px 0 0 rgba(255,255,255,0.06), inset -1px 0 0 rgba(0,0,0,0.4)",
          clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0% 100%)",
        }}
      />
      <div
        className="mx-auto relative"
        style={{
          width: "32%",
          height: "10px",
          background:
            "radial-gradient(ellipse at center top, #2a2a2a 0%, #1a1a1a 60%, #111111 100%)",
          borderRadius: "50% / 100% 100% 0 0",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.6)",
        }}
      />
      <div
        aria-hidden="true"
        className="mx-auto mt-1"
        style={{
          width: "55%",
          height: "12px",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 45%, transparent 75%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Phone frame
// ═══════════════════════════════════════════════════════════════════════════
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[22px] bg-neutral-950 p-[3px]"
      style={{
        boxShadow:
          "0 25px 50px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), 0 0 20px rgba(57, 255, 20, 0.2)",
      }}
    >
      <div className="relative rounded-[19px] overflow-hidden bg-black aspect-[390/844]">
        {children}

        <div
          aria-hidden="true"
          className="absolute top-[2.5%] left-1/2 -translate-x-1/2 h-[3.5%] w-[32%] bg-black rounded-full z-40 pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[1.2%] left-1/2 -translate-x-1/2 h-[3px] w-[30%] bg-white/40 rounded-full z-40 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
}

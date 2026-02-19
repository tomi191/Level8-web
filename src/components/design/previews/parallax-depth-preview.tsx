"use client";

import { useRef, useCallback, useState } from "react";

type Page = "main" | "features" | "info";

export function ParallaxDepthPreview() {
  const [page, setPage] = useState<Page>("main");
  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    if (layer1Ref.current) layer1Ref.current.style.transform = `translate(${x * 3}px, ${y * 3}px)`;
    if (layer2Ref.current) layer2Ref.current.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    if (layer3Ref.current) layer3Ref.current.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    [layer1Ref, layer2Ref, layer3Ref].forEach((ref) => {
      if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[340px] overflow-hidden rounded-lg bg-[#080c20] relative cursor-crosshair motion-reduce:cursor-default"
      role="region"
      aria-label="Паралакс и Дълбочина дизайн стил"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Layer 1 - Background: stars + grid */}
      <div ref={layer1Ref} className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              width: i % 3 === 0 ? "2px" : "1px",
              height: i % 3 === 0 ? "2px" : "1px",
            }}
          />
        ))}
        <div className="absolute top-12 left-10 w-32 h-32 rounded-full border border-blue-500/[0.06]" />
        <div className="absolute bottom-16 right-8 w-24 h-24 rounded-full border border-purple-500/[0.06]" />
      </div>

      {/* Layer 2 - Mid: gradient shapes + floating labels */}
      <div ref={layer2Ref} className="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none">
        <div className="absolute top-6 right-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/15 to-purple-500/5 blur-xl" />
        <div className="absolute bottom-10 left-8 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/5 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br from-violet-500/[0.07] to-fuchsia-500/[0.03] blur-2xl" />

        <div className="absolute top-8 left-16 w-6 h-6 border border-blue-400/20 rotate-45" />
        <div className="absolute bottom-14 right-16 w-5 h-5 border border-purple-400/20 rounded-full" />
        <div className="absolute top-1/3 right-8 w-4 h-8 border border-cyan-400/15 rounded-sm" />

        <div className="absolute top-8 left-8 px-2 py-1 rounded bg-blue-500/10 border border-blue-400/20 text-blue-300/60 text-[7px] font-mono">
          z-index: 1
        </div>
        <div className="absolute bottom-8 right-6 px-2 py-1 rounded bg-purple-500/10 border border-purple-400/20 text-purple-300/60 text-[7px] font-mono">
          z-index: 2
        </div>
      </div>

      {/* Layer 3 - Foreground: main content */}
      <div ref={layer3Ref} className="absolute inset-0 transition-transform duration-150 ease-out flex flex-col items-center justify-center motion-reduce:transition-none">
        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 w-52 text-center">
          {page === "main" && (
            <>
              <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-3 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
              </div>
              <div className="text-white font-semibold text-sm mb-1">3D Parallax</div>
              <div className="text-white/30 text-[9px] leading-relaxed mb-3">
                Move your mouse to feel the depth. Three layers responding independently.
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setPage("features")}
                  className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[8px] cursor-pointer hover:bg-blue-500/30 transition-colors"
                >
                  Explore
                </button>
                <button
                  onClick={() => setPage("info")}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[8px] cursor-pointer hover:bg-white/10 transition-colors"
                >
                  Learn more
                </button>
              </div>
            </>
          )}

          {page === "features" && (
            <>
              <div className="text-white/50 text-[8px] uppercase tracking-wider mb-3">Features</div>
              <div className="space-y-2.5 text-left mb-4">
                {[
                  { icon: "\u25C6", label: "Multi-layer depth", desc: "Independent transform speeds" },
                  { icon: "\u25CB", label: "Mouse tracking", desc: "Real-time cursor response" },
                  { icon: "\u25A0", label: "GPU accelerated", desc: "Smooth 60fps transforms" },
                  { icon: "\u25B2", label: "Responsive", desc: "Touch + mouse support" },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-2">
                    <span className="text-blue-400 text-[8px] mt-0.5">{f.icon}</span>
                    <div>
                      <div className="text-white/70 text-[9px] font-medium">{f.label}</div>
                      <div className="text-white/25 text-[7px]">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setPage("main")}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[8px] cursor-pointer hover:bg-white/10 transition-colors"
              >
                &larr; Back
              </button>
            </>
          )}

          {page === "info" && (
            <>
              <div className="text-white/50 text-[8px] uppercase tracking-wider mb-3">How it works</div>
              <p className="text-white/40 text-[9px] leading-relaxed mb-3 text-left">
                Parallax depth creates an illusion of 3D space using multiple layers that move at different speeds relative to mouse position.
              </p>
              <p className="text-white/30 text-[8px] leading-relaxed mb-4 text-left">
                The background layer (z:1) moves subtly, mid layer (z:2) moves moderately, and the foreground (z:3) moves the most — mimicking how we perceive depth in the real world.
              </p>
              <button
                onClick={() => setPage("main")}
                className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[8px] cursor-pointer hover:bg-blue-500/30 transition-colors"
              >
                &larr; Back
              </button>
            </>
          )}
        </div>

        {/* Floating tag */}
        <div className="absolute top-6 right-12 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300/70 text-[7px] font-mono flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-emerald-400" />
          z-index: 3
        </div>
      </div>
    </div>
  );
}

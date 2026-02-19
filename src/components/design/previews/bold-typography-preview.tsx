"use client";

import { useState } from "react";

type Page = "work" | "studio" | "contact";

export function BoldTypographyPreview() {
  const [page, setPage] = useState<Page>("work");

  return (
    <div
      className="h-[340px] overflow-hidden rounded-lg bg-[#fafaf9] flex flex-col"
      role="region"
      aria-label="Смела Типография дизайн стил"
    >
      {/* Nav */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200/60">
        <div className="text-[10px] font-black tracking-widest text-stone-900 uppercase">Atelier</div>
        <div className="flex gap-4 text-[9px]">
          {(["work", "studio", "contact"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`cursor-pointer capitalize transition-colors ${page === p ? "text-stone-900 font-bold" : "text-stone-400 hover:text-stone-600"}`}
            >
              {p === "work" ? "Work" : p === "studio" ? "Studio" : "Contact"}
            </button>
          ))}
        </div>
      </div>

      {/* Marquee strip */}
      <div className="bg-stone-900 py-1.5 overflow-hidden">
        <div className="flex whitespace-nowrap motion-reduce:animate-none animate-[bt-marquee_12s_linear_infinite]">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-[9px] text-stone-400 tracking-[0.15em] uppercase mx-4">
              Branding &bull; Digital Design &bull; Art Direction &bull; Motion &bull; Strategy &bull; Typography &bull;{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 pt-5 pb-4 flex flex-col justify-between overflow-hidden">
        {page === "work" && (
          <>
            <div className="flex items-start gap-3">
              <div
                className="text-[72px] leading-[0.85] font-black text-stone-200/60 -mt-1 select-none"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                01
              </div>
              <div className="pt-2">
                <h3
                  className="text-[32px] leading-[0.92] font-black text-stone-900 tracking-tighter"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  We create
                  <br />
                  <span className="text-[#e86833] inline-block hover:skew-x-[-2deg] transition-transform">digital</span>
                  <br />
                  experiences
                </h3>
              </div>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div>
                <div className="text-[9px] text-stone-400 mb-2 uppercase tracking-wider">Selected work</div>
                <div className="flex gap-2">
                  {[
                    { bg: "bg-stone-800", label: "Zara" },
                    { bg: "bg-[#e86833]/20", label: "Aesop" },
                    { bg: "bg-stone-200", label: "Muji" },
                  ].map((item) => (
                    <div key={item.label} className="group">
                      <div className={`w-14 h-14 rounded-lg ${item.bg} flex items-center justify-center transition-transform group-hover:scale-95`}>
                        <span className="text-[8px] text-stone-500 font-medium">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div
                  className="text-[11px] text-stone-500 flex items-center gap-1.5 border-b border-stone-300 pb-0.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Explore all <span className="text-stone-400">&rarr;</span>
                </div>
                <div className="text-[8px] text-stone-300 uppercase tracking-wider">Est. 2019</div>
              </div>
            </div>
          </>
        )}

        {page === "studio" && (
          <>
            <div className="flex items-start gap-3">
              <div
                className="text-[72px] leading-[0.85] font-black text-stone-200/60 -mt-1 select-none"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                02
              </div>
              <div className="pt-2">
                <h3
                  className="text-[28px] leading-[0.92] font-black text-stone-900 tracking-tighter"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  A studio
                  <br />
                  built on
                  <br />
                  <span className="text-[#e86833]">craft</span>
                </h3>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[9px] text-stone-500 leading-relaxed max-w-[220px] mb-3">
                We are a multidisciplinary design studio focused on brand identity, digital products, and visual storytelling.
              </p>
              <div className="flex gap-4">
                {[
                  { role: "Creative Dir.", name: "J. Muller" },
                  { role: "Lead Design", name: "A. Chen" },
                  { role: "Developer", name: "M. Santos" },
                ].map((t) => (
                  <div key={t.role}>
                    <div className="text-[7px] text-stone-400 uppercase tracking-wider">{t.role}</div>
                    <div className="text-[9px] text-stone-700 font-medium">{t.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {page === "contact" && (
          <>
            <div className="flex items-start gap-3">
              <div
                className="text-[72px] leading-[0.85] font-black text-stone-200/60 -mt-1 select-none"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                03
              </div>
              <div className="pt-2">
                <h3
                  className="text-[32px] leading-[0.92] font-black text-stone-900 tracking-tighter"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Say
                  <br />
                  <span className="text-[#e86833] inline-block hover:skew-x-[-2deg] transition-transform">hello</span>
                </h3>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="text-[8px] text-stone-400 uppercase tracking-wider mb-1">Email</div>
                <div className="text-[12px] text-stone-800 font-medium border-b border-stone-200 pb-1" style={{ fontFamily: "Georgia, serif" }}>
                  hello@atelier.studio
                </div>
              </div>
              <div>
                <div className="text-[8px] text-stone-400 uppercase tracking-wider mb-1">Location</div>
                <div className="text-[10px] text-stone-600" style={{ fontFamily: "Georgia, serif" }}>
                  Berlin, Germany
                </div>
              </div>
              <div className="flex gap-3 mt-1">
                {["Dribbble", "Behance", "Instagram"].map((s) => (
                  <span key={s} className="text-[8px] text-stone-400 border-b border-stone-200 pb-0.5">{s}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bt-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}} />
    </div>
  );
}

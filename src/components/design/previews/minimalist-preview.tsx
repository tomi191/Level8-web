"use client";

import { useState } from "react";

type Page = "collection" | "about" | "journal";

export function MinimalistPreview() {
  const [page, setPage] = useState<Page>("collection");
  const [activeThumb, setActiveThumb] = useState(0);

  const products = [
    { name: "Ceramic Vessel", price: "\u20AC120", desc: "Hand-thrown porcelain with matte glaze finish" },
    { name: "Stone Bowl", price: "\u20AC85", desc: "Natural river stone, polished interior" },
    { name: "Linen Vase", price: "\u20AC95", desc: "Woven linen over ceramic frame, raw edge" },
    { name: "Clay Planter", price: "\u20AC110", desc: "Terracotta with white slip glaze" },
  ];

  const active = products[activeThumb];

  return (
    <div
      className="h-[340px] overflow-hidden rounded-lg bg-white flex flex-col"
      role="region"
      aria-label="Минимализъм дизайн стил"
    >
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-[10px] font-medium tracking-[0.2em] text-stone-800 uppercase">
          Aura
        </div>
        <div className="flex gap-5 text-[9px]">
          {(["collection", "about", "journal"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`cursor-pointer capitalize transition-colors ${page === p ? "text-stone-800 font-medium" : "text-stone-400 hover:text-stone-600"}`}
            >
              {p === "collection" ? "Collection" : p === "about" ? "About" : "Journal"}
            </button>
          ))}
        </div>
        <div className="w-4 h-4 rounded-full border border-stone-200" />
      </div>

      <div className="w-full h-px bg-stone-100" />

      {page === "collection" && (
        <>
          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center relative">
                <div className={`w-16 h-16 rounded-full ${activeThumb === 0 ? "bg-stone-100/80" : activeThumb === 1 ? "bg-stone-200/80" : activeThumb === 2 ? "bg-stone-150/80" : "bg-amber-50/80"}`} />
                <div className="absolute top-2 right-2 w-3 h-3 rounded-full border border-stone-200" />
              </div>

              <div className="max-w-[120px]">
                <div className="text-[8px] text-stone-400 uppercase tracking-[0.15em] mb-1">New</div>
                <h4 className="text-[14px] font-light text-stone-800 tracking-wide leading-snug">
                  {active.name}
                </h4>
                <p className="text-[9px] text-stone-400 mt-1.5 leading-relaxed">
                  {active.desc}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[12px] text-stone-800 font-light">{active.price}</span>
                  <div className="px-3 py-1 border border-stone-800 text-[8px] text-stone-800 uppercase tracking-wider hover:bg-stone-800 hover:text-white transition-colors">
                    Add
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail row */}
            <div className="flex gap-3 mt-8">
              {products.map((_, n) => (
                <button
                  key={n}
                  onClick={() => setActiveThumb(n)}
                  className={`w-10 h-10 rounded-lg border cursor-pointer transition-colors ${n === activeThumb ? "border-stone-800" : "border-stone-100 hover:border-stone-300"} bg-stone-50 flex items-center justify-center`}
                >
                  <div className={`w-5 h-5 rounded-full ${n === activeThumb ? "bg-stone-200" : "bg-stone-100"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-stone-100 px-6 py-3 flex items-center justify-between">
            <div className="flex gap-3">
              {products.map((_, i) => (
                <div key={i} className={`w-6 h-[2px] rounded-full ${i === activeThumb ? "bg-stone-800" : "bg-stone-200"}`} />
              ))}
            </div>
            <div className="text-[8px] text-stone-300 tracking-wider uppercase">
              Scroll to explore
            </div>
            <div className="text-[9px] text-stone-400 flex items-center gap-1">
              All products <span>&rarr;</span>
            </div>
          </div>
        </>
      )}

      {page === "about" && (
        <div className="flex-1 flex flex-col justify-center px-8 py-6">
          <div className="text-[8px] text-stone-400 uppercase tracking-[0.2em] mb-3">Our Story</div>
          <h4 className="text-[18px] font-light text-stone-800 tracking-wide leading-snug mb-4">
            Simplicity is the ultimate sophistication.
          </h4>
          <p className="text-[9px] text-stone-400 leading-relaxed mb-4 max-w-[240px]">
            Founded in 2020, Aura is a design-led studio creating objects of quiet beauty. We believe in the power of restraint — every piece is pared back to its essential form.
          </p>
          <p className="text-[9px] text-stone-400 leading-relaxed max-w-[240px]">
            Our materials are sourced locally, shaped by hand, and finished with care. Nothing more, nothing less.
          </p>
          <div className="mt-6 flex gap-6">
            <div>
              <div className="text-[16px] font-light text-stone-800">48</div>
              <div className="text-[7px] text-stone-400 uppercase tracking-wider">Products</div>
            </div>
            <div>
              <div className="text-[16px] font-light text-stone-800">12</div>
              <div className="text-[7px] text-stone-400 uppercase tracking-wider">Countries</div>
            </div>
            <div>
              <div className="text-[16px] font-light text-stone-800">5</div>
              <div className="text-[7px] text-stone-400 uppercase tracking-wider">Years</div>
            </div>
          </div>
        </div>
      )}

      {page === "journal" && (
        <div className="flex-1 flex flex-col px-6 py-5 gap-4">
          <div className="text-[8px] text-stone-400 uppercase tracking-[0.2em]">Latest</div>
          {[
            { title: "The Art of Less", date: "Feb 12, 2026", tag: "Design" },
            { title: "Material Matters", date: "Jan 28, 2026", tag: "Craft" },
            { title: "A Season of Calm", date: "Jan 15, 2026", tag: "Editorial" },
          ].map((post) => (
            <div key={post.title} className="border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[7px] text-stone-400 uppercase tracking-wider">{post.date}</span>
                <span className="text-[7px] text-stone-300">&bull;</span>
                <span className="text-[7px] text-stone-400 uppercase tracking-wider">{post.tag}</span>
              </div>
              <div className="text-[12px] font-light text-stone-800 tracking-wide">{post.title}</div>
              <div className="text-[8px] text-stone-400 mt-1">Read &rarr;</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

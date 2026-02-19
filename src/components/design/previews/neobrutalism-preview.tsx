"use client";

import { useState } from "react";

type Page = "home" | "blog" | "signup";

export function NeobrutalismPreview() {
  const [page, setPage] = useState<Page>("home");

  return (
    <div
      className="h-[340px] overflow-hidden rounded-lg bg-[#fffdf7] flex flex-col"
      role="region"
      aria-label="Необрутализъм дизайн стил"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b-[3px] border-black">
        <button onClick={() => setPage("home")} className="font-black text-sm text-black uppercase cursor-pointer">Brutal.co</button>
        <div className="flex gap-2">
          <button
            onClick={() => setPage("blog")}
            className={`px-2 py-0.5 border-2 border-black text-[8px] font-bold uppercase transition-all cursor-pointer ${page === "blog" ? "shadow-[1px_1px_0_#000] translate-x-[1px] translate-y-[1px] bg-[#FFE156]" : "shadow-[2px_2px_0_#000] bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000]"}`}
          >
            Blog
          </button>
          <button
            onClick={() => setPage("signup")}
            className={`px-2 py-0.5 border-2 border-black text-[8px] font-bold uppercase transition-all cursor-pointer ${page === "signup" ? "shadow-[1px_1px_0_#000] translate-x-[1px] translate-y-[1px] bg-[#FF6B6B]" : "shadow-[2px_2px_0_#000] bg-[#FFE156] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000]"}`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="bg-black py-1 overflow-hidden">
        <div className="flex whitespace-nowrap motion-reduce:animate-none animate-[nb-scroll_10s_linear_infinite]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="text-[9px] text-[#FFE156] font-bold uppercase tracking-wider mx-3">
              &#9733; No rules &#9733; Be bold &#9733; Break stuff &#9733; Ship fast &#9733; Have fun &#9733;{" "}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
        {page === "home" && (
          <>
            {/* Hero card */}
            <div className="flex-1 border-[3px] border-black rounded-md shadow-[5px_5px_0_#000] bg-[#FFE156] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-1 -right-1 px-2 py-1 bg-[#FF6B6B] border-2 border-black text-[7px] font-black uppercase text-black rotate-12 shadow-[2px_2px_0_#000]">
                Hot!
              </div>
              <div>
                <div className="inline-block px-2 py-0.5 bg-black text-[#FFE156] text-[7px] font-bold uppercase -rotate-1 mb-2">
                  Featured
                </div>
                <h3 className="text-xl font-black text-black leading-tight uppercase tracking-tight">
                  Design with
                  <br />
                  no rules.
                </h3>
                <p className="text-[9px] text-black/60 mt-1 font-medium max-w-[200px]">
                  Break conventions. Build things that stand out. No templates, no boring stuff.
                </p>
              </div>
              <div className="flex gap-2 items-end mt-2">
                <button
                  onClick={() => setPage("signup")}
                  className="px-3 py-1.5 bg-black text-white text-[9px] font-bold uppercase border-2 border-black shadow-[3px_3px_0_#FF6B6B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#FF6B6B] transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#FF6B6B]"
                >
                  Start building &rarr;
                </button>
                <button
                  onClick={() => setPage("blog")}
                  className="px-3 py-1.5 bg-white text-black text-[9px] font-bold uppercase border-2 border-black shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#000]"
                >
                  See work
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-2">
              {[
                { value: "42", label: "Projects", bg: "#A8E6CF", sticker: null },
                { value: "99%", label: "Happy", bg: "#DDA0DD", sticker: ":-)" },
                { value: "24/7", label: "Support", bg: "#87CEEB", sticker: null },
                { value: "0", label: "Templates", bg: "#FFB3BA", sticker: "!" },
              ].map((s) => (
                <div key={s.label} className="flex-1 border-[3px] border-black rounded-md shadow-[3px_3px_0_#000] p-2 text-center relative hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all cursor-default"
                  style={{ backgroundColor: s.bg }}
                >
                  {s.sticker && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white text-[6px] font-black flex items-center justify-center rotate-12">
                      {s.sticker}
                    </div>
                  )}
                  <div className="text-base font-black text-black">{s.value}</div>
                  <div className="text-[7px] font-bold uppercase text-black/60">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "blog" && (
          <div className="flex flex-col gap-2.5 overflow-hidden">
            <div className="inline-block px-2 py-0.5 bg-black text-[#FFE156] text-[7px] font-bold uppercase -rotate-1 self-start">
              Latest Posts
            </div>
            {[
              { title: "Why Boring Design is Dead", tag: "Opinion", color: "#FFE156" },
              { title: "Build a Portfolio in 1 Hour", tag: "Tutorial", color: "#A8E6CF" },
              { title: "The Anti-Minimalism Movement", tag: "Trends", color: "#DDA0DD" },
            ].map((post) => (
              <div key={post.title} className="border-[3px] border-black rounded-md shadow-[3px_3px_0_#000] p-3 flex items-center justify-between hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all" style={{ backgroundColor: post.color }}>
                <div>
                  <div className="text-[10px] font-black text-black uppercase">{post.title}</div>
                  <div className="text-[7px] font-bold text-black/50 uppercase mt-0.5">{post.tag}</div>
                </div>
                <div className="px-2 py-1 bg-black text-white text-[7px] font-bold uppercase border-2 border-black">
                  Read &rarr;
                </div>
              </div>
            ))}
            <button
              onClick={() => setPage("home")}
              className="px-3 py-1.5 bg-white text-black text-[8px] font-bold uppercase border-2 border-black shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all cursor-pointer self-start mt-1"
            >
              &larr; Back home
            </button>
          </div>
        )}

        {page === "signup" && (
          <div className="flex flex-col gap-3 overflow-hidden">
            <div className="border-[3px] border-black rounded-md shadow-[5px_5px_0_#000] bg-[#FFE156] p-4">
              <div className="inline-block px-2 py-0.5 bg-[#FF6B6B] text-black text-[7px] font-bold uppercase rotate-1 mb-3 border-2 border-black">
                Join the crew!
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[8px] font-bold uppercase text-black/60 mb-1">Name</div>
                  <div className="w-full h-7 border-[3px] border-black rounded bg-white px-2 flex items-center text-[9px] text-black/30">
                    Your name...
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-bold uppercase text-black/60 mb-1">Email</div>
                  <div className="w-full h-7 border-[3px] border-black rounded bg-white px-2 flex items-center text-[9px] text-black/30">
                    you@email.com
                  </div>
                </div>
                <button className="w-full py-2 bg-black text-white text-[10px] font-bold uppercase border-[3px] border-black shadow-[4px_4px_0_#FF6B6B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#FF6B6B] transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#FF6B6B]">
                  Let&apos;s Go! &#9733;
                </button>
              </div>
            </div>
            <button
              onClick={() => setPage("home")}
              className="px-3 py-1.5 bg-white text-black text-[8px] font-bold uppercase border-2 border-black shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all cursor-pointer self-start"
            >
              &larr; Back home
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nb-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}} />
    </div>
  );
}

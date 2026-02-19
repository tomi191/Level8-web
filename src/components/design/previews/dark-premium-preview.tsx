"use client";

import { useEffect, useState } from "react";

type Page = "home" | "docs" | "pricing";

export function DarkPremiumPreview() {
  const [page, setPage] = useState<Page>("home");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [typedLen, setTypedLen] = useState(0);
  const codeLine = "npx create-next-app@latest";

  useEffect(() => {
    const match = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (match.matches) {
      setTypedLen(codeLine.length);
      return;
    }

    const cursorInterval = setInterval(() => setCursorVisible((v) => !v), 530);
    const typeInterval = setInterval(() => {
      setTypedLen((prev) => {
        if (prev >= codeLine.length) return prev;
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(cursorInterval);
      clearInterval(typeInterval);
    };
  }, []);

  return (
    <div
      className="h-[340px] overflow-hidden rounded-lg relative bg-[#050507]"
      role="region"
      aria-label="Тъмен Премиум дизайн стил"
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none motion-reduce:hidden"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
        }}
      />

      {/* Neon glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-32 rounded-full bg-[#39ff14]/[0.04] blur-3xl" />

      {/* Floating particles */}
      {[
        { top: "15%", left: "12%", size: "1.5px", delay: "0s", dur: "4s" },
        { top: "25%", left: "78%", size: "1px", delay: "1s", dur: "5s" },
        { top: "60%", left: "22%", size: "1px", delay: "2s", dur: "6s" },
        { top: "70%", left: "85%", size: "1.5px", delay: "0.5s", dur: "4.5s" },
        { top: "45%", left: "55%", size: "1px", delay: "1.5s", dur: "5.5s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#39ff14]/30 motion-reduce:animate-none animate-[dp-particle_var(--dur)_ease-in-out_infinite_var(--delay)]"
          style={{
            top: p.top, left: p.left, width: p.size, height: p.size,
            "--delay": p.delay, "--dur": p.dur,
          } as React.CSSProperties}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-5 pt-5">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setPage("home")} className="text-[11px] font-bold text-white tracking-wider cursor-pointer">NEXUS<span className="text-[#39ff14]">.</span></button>
          <div className="flex gap-4 text-[9px]">
            <button onClick={() => setPage("docs")} className={`cursor-pointer transition-colors ${page === "docs" ? "text-[#39ff14]/70" : "text-white/30 hover:text-white/50"}`}>Docs</button>
            <button onClick={() => setPage("pricing")} className={`cursor-pointer transition-colors ${page === "pricing" ? "text-[#39ff14]/70" : "text-white/30 hover:text-white/50"}`}>Pricing</button>
            <span className="text-[#39ff14]/70">Login</span>
          </div>
        </div>

        {page === "home" && (
          <>
            {/* Hero text */}
            <div className="text-center flex-1 flex flex-col items-center justify-center -mt-4">
              <div className="text-[9px] tracking-[0.3em] text-[#39ff14]/50 uppercase font-mono mb-3">
                // next generation framework
              </div>
              <h3 className="text-[26px] font-bold text-white mb-1 tracking-tight leading-tight">
                Build the{" "}
                <span
                  className="text-[#39ff14]"
                  style={{ textShadow: "0 0 20px rgba(57,255,20,0.4), 0 0 40px rgba(57,255,20,0.1)" }}
                >
                  Future
                </span>
              </h3>
              <p className="text-white/25 text-[10px] max-w-[220px] mt-1 font-mono leading-relaxed">
                Ship faster with zero-config deploys, edge rendering, and AI-powered tooling.
              </p>

              {/* CTA buttons */}
              <div className="flex gap-2 mt-4">
                <div className="px-4 py-1.5 bg-[#39ff14] rounded text-[10px] text-black font-semibold tracking-wide">
                  Get Started
                </div>
                <div className="px-4 py-1.5 border border-white/10 rounded text-[10px] text-white/50 font-mono">
                  Star on GitHub
                </div>
              </div>
            </div>

            {/* Terminal snippet */}
            <div className="mb-4 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 font-mono">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                <span className="text-[7px] text-white/20 ml-1">terminal</span>
              </div>
              <div className="text-[10px]">
                <span className="text-[#39ff14]/60">$</span>{" "}
                <span className="text-white/70">{codeLine.slice(0, typedLen)}</span>
                <span
                  className="inline-block w-[5px] h-[12px] bg-[#39ff14] ml-0.5 align-middle"
                  style={{ opacity: cursorVisible ? 1 : 0 }}
                />
              </div>
            </div>
          </>
        )}

        {page === "docs" && (
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            <div className="text-[9px] tracking-[0.2em] text-[#39ff14]/50 uppercase font-mono">
              // documentation
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 font-mono flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                <span className="text-[7px] text-white/20 ml-1">app/page.tsx</span>
              </div>
              <div className="text-[9px] leading-relaxed space-y-0.5">
                <div><span className="text-purple-400">import</span> <span className="text-cyan-300">{"{ NextPage }"}</span> <span className="text-purple-400">from</span> <span className="text-[#39ff14]/60">{`"next"`}</span></div>
                <div />
                <div><span className="text-purple-400">export default</span> <span className="text-cyan-300">function</span> <span className="text-yellow-300">Home</span><span className="text-white/50">() {"{"}</span></div>
                <div><span className="text-white/30">{"  "}</span><span className="text-purple-400">return</span> <span className="text-white/50">(</span></div>
                <div><span className="text-white/30">{"    "}</span><span className="text-red-400">{"<main"}</span> <span className="text-cyan-300">className</span><span className="text-white/50">=</span><span className="text-[#39ff14]/60">{`"flex"`}</span><span className="text-red-400">{">"}</span></div>
                <div><span className="text-white/30">{"      "}</span><span className="text-red-400">{"<h1>"}</span><span className="text-white/70">Hello Nexus</span><span className="text-red-400">{"</h1>"}</span></div>
                <div><span className="text-white/30">{"    "}</span><span className="text-red-400">{"</main>"}</span></div>
                <div><span className="text-white/30">{"  "}</span><span className="text-white/50">)</span></div>
                <div><span className="text-white/50">{"}"}</span></div>
              </div>
            </div>
            <div className="flex gap-2 text-[8px] font-mono mb-4">
              <div className="px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-white/30">Getting Started</div>
              <div className="px-2 py-1 bg-[#39ff14]/10 border border-[#39ff14]/20 rounded text-[#39ff14]/60">API Reference</div>
              <div className="px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-white/30">Examples</div>
            </div>
          </div>
        )}

        {page === "pricing" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 -mt-2">
            <div className="text-[9px] tracking-[0.2em] text-[#39ff14]/50 uppercase font-mono mb-1">
              // choose your plan
            </div>
            <div className="flex gap-3 w-full">
              {/* Free tier */}
              <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Free</div>
                <div className="text-xl font-bold text-white mb-1">$0</div>
                <div className="text-[8px] text-white/20 mb-3">forever</div>
                <div className="space-y-1.5">
                  {["1 project", "10k requests/mo", "Community support"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-[8px] text-white/40">
                      <span className="text-[#39ff14]/50">&#10003;</span> {f}
                    </div>
                  ))}
                </div>
                <div className="mt-3 w-full py-1.5 border border-white/10 rounded text-[9px] text-white/40 text-center font-mono">
                  Current plan
                </div>
              </div>
              {/* Pro tier */}
              <div className="flex-1 bg-[#39ff14]/[0.05] border border-[#39ff14]/20 rounded-lg p-3 relative">
                <div className="absolute -top-1.5 right-2 px-1.5 py-0.5 bg-[#39ff14] text-black text-[6px] font-bold uppercase rounded">Popular</div>
                <div className="text-[9px] text-[#39ff14]/60 uppercase tracking-wider mb-1">Pro</div>
                <div className="text-xl font-bold text-white mb-1">$29</div>
                <div className="text-[8px] text-white/20 mb-3">/month</div>
                <div className="space-y-1.5">
                  {["Unlimited projects", "1M requests/mo", "Priority support"].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-[8px] text-white/40">
                      <span className="text-[#39ff14]">&#10003;</span> {f}
                    </div>
                  ))}
                </div>
                <div className="mt-3 w-full py-1.5 bg-[#39ff14] rounded text-[9px] text-black font-semibold text-center">
                  Upgrade
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animated gradient line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#39ff14]/30 to-transparent mb-3 motion-reduce:animate-none animate-[dp-line_3s_ease-in-out_infinite]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dp-particle {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-8px); }
        }
        @keyframes dp-line {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}} />
    </div>
  );
}

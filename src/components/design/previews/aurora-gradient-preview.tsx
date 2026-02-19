"use client";

import { useState } from "react";

type Page = "home" | "features" | "pricing" | "about";

export function AuroraGradientPreview() {
  const [page, setPage] = useState<Page>("home");

  return (
    <div
      className="h-[340px] overflow-hidden rounded-lg bg-[#0f0f23] relative"
      role="region"
      aria-label="Аврора Градиенти дизайн стил"
    >
      {/* Aurora blobs */}
      <div className="absolute inset-0">
        <div
          className="absolute w-44 h-44 rounded-full blur-3xl opacity-50 motion-reduce:animate-none animate-[aurora1_8s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", top: "5%", left: "15%" }}
        />
        <div
          className="absolute w-40 h-40 rounded-full blur-3xl opacity-40 motion-reduce:animate-none animate-[aurora2_10s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)", top: "25%", right: "10%" }}
        />
        <div
          className="absolute w-48 h-48 rounded-full blur-3xl opacity-35 motion-reduce:animate-none animate-[aurora3_12s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)", bottom: "0%", left: "35%" }}
        />
        <div
          className="absolute w-32 h-32 rounded-full blur-2xl opacity-30 motion-reduce:animate-none animate-[aurora1_9s_ease-in-out_infinite_reverse]"
          style={{ background: "radial-gradient(circle, #10b981, transparent 70%)", top: "50%", left: "5%" }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col z-10">
        {/* Nav */}
        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={() => setPage("home")} className="text-[11px] font-bold text-white/80 tracking-wide cursor-pointer">Lumina<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">.</span></button>
          <div className="flex gap-4 text-[9px]">
            {(["features", "pricing", "about"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`cursor-pointer capitalize transition-colors ${page === p ? "text-white/70 font-medium" : "text-white/30 hover:text-white/50"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5">
          {page === "home" && (
            <>
              {/* Floating pills */}
              <div className="flex gap-2 mb-4">
                {[
                  { label: "10k+ users", color: "from-violet-500/20 to-violet-500/5 border-violet-400/20 text-violet-300/70" },
                  { label: "99.9% uptime", color: "from-cyan-500/20 to-cyan-500/5 border-cyan-400/20 text-cyan-300/70" },
                  { label: "AI-powered", color: "from-pink-500/20 to-pink-500/5 border-pink-400/20 text-pink-300/70" },
                ].map((pill) => (
                  <div key={pill.label} className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${pill.color} border text-[8px] backdrop-blur-sm`}>
                    {pill.label}
                  </div>
                ))}
              </div>

              {/* Card */}
              <div className="backdrop-blur-md bg-white/[0.06] border border-white/[0.1] rounded-2xl p-5 w-56 text-center">
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                  Aurora UI
                </div>
                <div className="text-xl font-bold text-white mb-1.5">
                  Feel the
                  <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    {" "}glow
                  </span>
                </div>
                <p className="text-white/25 text-[9px] leading-relaxed mb-4">
                  Animated gradients that bring your interface to life with mesmerizing color flows.
                </p>

                <div className="flex flex-col gap-1.5 mb-4 text-left px-2">
                  {["Dynamic color themes", "Zero-config setup", "60fps animations"].map((feat) => (
                    <div key={feat} className="flex items-center gap-1.5 text-[8px] text-white/40">
                      <div className="w-1 h-1 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
                      {feat}
                    </div>
                  ))}
                </div>

                <div className="mx-auto w-full h-8 rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-medium shadow-lg shadow-violet-500/20">
                  Get Started Free
                </div>
              </div>
            </>
          )}

          {page === "features" && (
            <div className="backdrop-blur-md bg-white/[0.06] border border-white/[0.1] rounded-2xl p-5 w-56">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3 text-center">
                Features
              </div>
              <div className="space-y-3">
                {[
                  { icon: "\u2728", title: "Aurora Engine", desc: "Real-time gradient blending with GPU acceleration" },
                  { icon: "\u26A1", title: "Instant Themes", desc: "Switch between 20+ presets with one click" },
                  { icon: "\u{1F3A8}", title: "Custom Palettes", desc: "Create your own color schemes with live preview" },
                ].map((f) => (
                  <div key={f.title} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-white/10 flex items-center justify-center text-[11px] shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-[10px] text-white/80 font-medium">{f.title}</div>
                      <div className="text-[8px] text-white/30 leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "pricing" && (
            <div className="backdrop-blur-md bg-white/[0.06] border border-white/[0.1] rounded-2xl p-5 w-56 text-center">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                Pro Plan
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">
                $19<span className="text-sm font-normal text-white/30">/mo</span>
              </div>
              <p className="text-[8px] text-white/25 mb-4">Billed annually. Cancel anytime.</p>
              <div className="flex flex-col gap-2 mb-4 text-left px-1">
                {[
                  "Unlimited aurora themes",
                  "Custom color palettes",
                  "React + Vue + Svelte",
                  "Priority support",
                  "Commercial license",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-1.5 text-[8px] text-white/40">
                    <span className="text-cyan-400 text-[7px]">&#10003;</span>
                    {feat}
                  </div>
                ))}
              </div>
              <div className="w-full h-8 rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-pink-500 flex items-center justify-center text-[10px] text-white font-medium shadow-lg shadow-violet-500/20">
                Subscribe Now
              </div>
            </div>
          )}

          {page === "about" && (
            <div className="backdrop-blur-md bg-white/[0.06] border border-white/[0.1] rounded-2xl p-5 w-56 text-center">
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 mb-3">
                About Lumina
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed mb-3 text-left">
                Lumina was born from a simple idea: what if UI backgrounds could feel alive? We set out to create the most beautiful gradient animation library on the web.
              </p>
              <p className="text-[9px] text-white/30 leading-relaxed mb-4 text-left">
                Built by a team of 3 designers and engineers, Lumina is now used by over 10,000 developers worldwide.
              </p>
              <div className="flex justify-center gap-4">
                <div>
                  <div className="text-[14px] font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">10k+</div>
                  <div className="text-[7px] text-white/30 uppercase">Users</div>
                </div>
                <div>
                  <div className="text-[14px] font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">50+</div>
                  <div className="text-[7px] text-white/30 uppercase">Themes</div>
                </div>
                <div>
                  <div className="text-[14px] font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-[7px] text-white/30 uppercase">Uptime</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom text */}
        <div className="text-center pb-3 text-[8px] text-white/20">
          Trusted by teams at <span className="text-white/30">Vercel</span>, <span className="text-white/30">Linear</span>, <span className="text-white/30">Raycast</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes aurora1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.1); }
          66% { transform: translate(-10px, 10px) scale(0.95); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 10px) scale(1.05); }
          66% { transform: translate(15px, -20px) scale(1.1); }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -10px) scale(1.15); }
          66% { transform: translate(-20px, 5px) scale(0.9); }
        }
      `}} />
    </div>
  );
}

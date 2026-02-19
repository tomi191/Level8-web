"use client";

import { useState } from "react";

type Page = "dashboard" | "cards" | "settings";

export function GlassmorphismPreview() {
  const [page, setPage] = useState<Page>("dashboard");
  const [yearly, setYearly] = useState(true);

  return (
    <div
      className="h-[340px] overflow-hidden rounded-lg relative"
      role="region"
      aria-label="Стъкломорфизъм дизайн стил"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500" />

      {/* Floating blobs */}
      <div className="absolute top-2 left-6 w-32 h-32 rounded-full bg-yellow-300/40 blur-2xl motion-reduce:animate-none animate-[glass-float_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-4 right-4 w-36 h-36 rounded-full bg-cyan-300/40 blur-2xl motion-reduce:animate-none animate-[glass-float_8s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-24 right-20 w-24 h-24 rounded-full bg-emerald-300/30 blur-xl motion-reduce:animate-none animate-[glass-float_7s_ease-in-out_infinite_1s]" />
      <div className="absolute bottom-20 left-16 w-20 h-20 rounded-full bg-orange-300/30 blur-xl motion-reduce:animate-none animate-[glass-float_9s_ease-in-out_infinite_0.5s]" />

      {/* Glass nav bar */}
      <div className="relative z-10 mx-4 mt-4 backdrop-blur-xl bg-white/15 border border-white/20 rounded-xl px-4 py-2 flex items-center justify-between">
        <div className="text-white font-bold text-[11px] tracking-wide">Finova</div>
        <div className="flex gap-3 text-[9px]">
          {(["dashboard", "cards", "settings"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`cursor-pointer capitalize transition-colors ${page === p ? "text-white font-medium" : "text-white/50 hover:text-white/80"}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 text-[8px] text-white flex items-center justify-center">A</div>
      </div>

      {page === "dashboard" && (
        <>
          {/* Search bar */}
          <div className="relative z-10 mx-4 mt-3 backdrop-blur-lg bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="text-white/40 text-[10px]">&#128269;</span>
            <span className="text-white/30 text-[9px]">Search transactions...</span>
          </div>

          {/* Glass cards row */}
          <div className="relative z-10 flex gap-3 px-4 mt-4">
            {/* Card 1 - Balance */}
            <div className="backdrop-blur-xl bg-white/15 border border-white/25 rounded-2xl p-4 w-[130px] shadow-lg">
              <div className="text-[9px] text-white/50 uppercase tracking-wider mb-1">Balance</div>
              <div className="text-xl font-bold text-white mb-2">{yearly ? "$149,760" : "$12,480"}</div>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 border border-white/30" />
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 border border-white/30" />
                </div>
                <span className="text-[8px] text-emerald-200">{yearly ? "+$10,080" : "+$840"}</span>
              </div>
              <div className="mt-2.5 h-1 rounded-full bg-white/10">
                <div className="h-1 rounded-full bg-white/40 w-3/4" />
              </div>
            </div>

            {/* Card 2 - Activity */}
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 w-[130px] shadow-lg translate-y-3">
              <div className="text-[9px] text-white/50 uppercase tracking-wider mb-1">This week</div>
              <div className="space-y-1.5 mt-2">
                {[
                  { name: "Spotify", amount: "-$9.99", color: "bg-green-400/30" },
                  { name: "Apple", amount: "-$2.99", color: "bg-white/20" },
                  { name: "Transfer", amount: "+$500", color: "bg-blue-400/30" },
                ].map((tx) => (
                  <div key={tx.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-3 h-3 rounded ${tx.color}`} />
                      <span className="text-[8px] text-white/80">{tx.name}</span>
                    </div>
                    <span className={`text-[8px] ${tx.amount.startsWith("+") ? "text-emerald-300" : "text-white/50"}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {page === "cards" && (
        <div className="relative z-10 px-4 mt-4 flex flex-col gap-3">
          {/* Credit card 1 */}
          <div className="backdrop-blur-xl bg-white/15 border border-white/25 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] text-white/50 uppercase tracking-wider">Platinum</div>
              <div className="text-[9px] text-white/70 font-mono">VISA</div>
            </div>
            <div className="text-[11px] text-white/80 font-mono tracking-[0.2em] mb-3">**** **** **** 4829</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[7px] text-white/40 uppercase">Balance</div>
                <div className="text-sm font-bold text-white">$8,240</div>
              </div>
              <div>
                <div className="text-[7px] text-white/40 uppercase">Expires</div>
                <div className="text-[10px] text-white/70 font-mono">12/27</div>
              </div>
            </div>
          </div>
          {/* Card 2 */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] text-white/50 uppercase tracking-wider">Standard</div>
              <div className="text-[9px] text-white/70 font-mono">MC</div>
            </div>
            <div className="text-[11px] text-white/80 font-mono tracking-[0.2em] mb-3">**** **** **** 1053</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[7px] text-white/40 uppercase">Balance</div>
                <div className="text-sm font-bold text-white">$3,120</div>
              </div>
              <div>
                <div className="text-[7px] text-white/40 uppercase">Expires</div>
                <div className="text-[10px] text-white/70 font-mono">08/26</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === "settings" && (
        <div className="relative z-10 px-4 mt-4 flex flex-col gap-3">
          {/* Profile */}
          <div className="backdrop-blur-xl bg-white/15 border border-white/25 rounded-2xl p-4 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm">A</div>
            <div>
              <div className="text-[11px] text-white font-medium">Alex Morgan</div>
              <div className="text-[8px] text-white/40">alex@finova.io</div>
            </div>
          </div>
          {/* Toggle options */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg space-y-3">
            {[
              { label: "Push Notifications", on: true },
              { label: "Biometric Login", on: true },
              { label: "Auto-sync", on: false },
              { label: "Marketing Emails", on: false },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[9px] text-white/70">{s.label}</span>
                <div className={`w-7 h-3.5 rounded-full relative ${s.on ? "bg-white/40" : "bg-white/10"}`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${s.on ? "right-0.5 bg-white" : "left-0.5 bg-white/40"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating toggle pill */}
      <button
        onClick={() => setYearly(!yearly)}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 backdrop-blur-xl bg-white/15 border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors"
      >
        <span className={`text-[9px] ${!yearly ? "text-white font-medium" : "text-white/60"}`}>Monthly</span>
        <div className="w-7 h-3.5 rounded-full bg-white/25 relative">
          <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-all ${yearly ? "right-0.5" : "left-0.5"}`} />
        </div>
        <span className={`text-[9px] ${yearly ? "text-white font-medium" : "text-white/60"}`}>Yearly</span>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glass-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
      `}} />
    </div>
  );
}

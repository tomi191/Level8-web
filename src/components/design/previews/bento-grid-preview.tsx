"use client";

import { useState } from "react";

type Page = "dashboard" | "analytics" | "users" | "settings";

export function BentoGridPreview() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <div
      className="h-[340px] bg-[#0c0c1d] overflow-hidden rounded-lg flex"
      role="region"
      aria-label="Бенто Грид дизайн стил"
    >
      {/* Mini sidebar */}
      <div className="w-10 shrink-0 bg-white/[0.03] border-r border-white/[0.06] flex flex-col items-center py-3 gap-3">
        <div className="w-5 h-5 rounded-md bg-purple-500/30 border border-purple-400/30" />
        <button
          onClick={() => setPage("dashboard")}
          className={`w-[18px] h-[18px] rounded cursor-pointer transition-colors ${page === "dashboard" ? "bg-purple-500/30 border border-purple-400/40" : "bg-white/[0.06] hover:bg-white/[0.12]"}`}
          aria-label="Dashboard"
        />
        <button
          onClick={() => setPage("analytics")}
          className={`w-[18px] h-[18px] rounded cursor-pointer transition-colors ${page === "analytics" ? "bg-purple-500/30 border border-purple-400/40" : "bg-white/[0.06] hover:bg-white/[0.12]"}`}
          aria-label="Analytics"
        />
        <button
          onClick={() => setPage("users")}
          className={`w-[18px] h-[18px] rounded cursor-pointer transition-colors ${page === "users" ? "bg-purple-500/30 border border-purple-400/40" : "bg-white/[0.06] hover:bg-white/[0.12]"}`}
          aria-label="Users"
        />
        <button
          onClick={() => setPage("settings")}
          className={`w-[18px] h-[18px] rounded cursor-pointer transition-colors ${page === "settings" ? "bg-purple-500/30 border border-purple-400/40" : "bg-white/[0.06] hover:bg-white/[0.12]"}`}
          aria-label="Settings"
        />
        <div className="mt-auto w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-[7px] text-white flex items-center justify-center font-bold">
          N
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-3 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-white/50 font-medium capitalize">{page}</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-4 h-4 rounded bg-white/[0.06] flex items-center justify-center text-[8px] text-white/30">&#9826;</div>
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 motion-reduce:animate-none animate-pulse" />
            </div>
            <div className="flex -space-x-1.5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border border-[#0c0c1d]" />
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 border border-[#0c0c1d]" />
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border border-[#0c0c1d]" />
            </div>
          </div>
        </div>

        {page === "dashboard" && (
          <div className="grid grid-cols-3 grid-rows-3 gap-2 h-[calc(100%-28px)]">
            {/* Revenue - large card 2x2 */}
            <div className="col-span-2 row-span-2 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/15 border border-purple-500/15 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[9px] text-purple-300/60 uppercase tracking-wider">Monthly Revenue</div>
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[8px] text-emerald-400">+12.5%</div>
                </div>
                <div className="text-2xl font-bold text-white mt-1">$48,294</div>
                <div className="text-[9px] text-white/30 mt-0.5">vs $42,930 last month</div>
              </div>
              <div className="mt-2">
                <svg viewBox="0 0 200 50" className="w-full h-10" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bento-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(168,85,247)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(168,85,247)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,40 L20,35 L40,38 L60,25 L80,28 L100,15 L120,20 L140,10 L160,14 L180,5 L200,8 L200,50 L0,50Z" fill="url(#bento-grad)" />
                  <path d="M0,40 L20,35 L40,38 L60,25 L80,28 L100,15 L120,20 L140,10 L160,14 L180,5 L200,8" fill="none" stroke="rgb(168,85,247)" strokeWidth="1.5" />
                  <circle cx="200" cy="8" r="2.5" fill="rgb(168,85,247)" className="motion-reduce:animate-none animate-pulse" />
                </svg>
              </div>
            </div>

            {/* Users card */}
            <div className="rounded-xl bg-gradient-to-br from-blue-600/15 to-cyan-600/10 border border-blue-500/15 p-2.5 flex flex-col justify-between">
              <div className="text-[9px] text-blue-300/60 uppercase tracking-wider">Active</div>
              <div>
                <div className="text-lg font-bold text-white">2,847</div>
                <div className="flex -space-x-1 mt-1">
                  {["from-pink-400 to-rose-500", "from-blue-400 to-cyan-500", "from-green-400 to-emerald-500", "from-amber-400 to-orange-500"].map((g, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full bg-gradient-to-br ${g} border border-[#0c0c1d]`} />
                  ))}
                  <div className="w-3 h-3 rounded-full bg-white/10 border border-[#0c0c1d] text-[5px] text-white/50 flex items-center justify-center">+</div>
                </div>
              </div>
            </div>

            {/* Conversion card */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-600/15 to-teal-600/10 border border-emerald-500/15 p-2.5 flex flex-col justify-between">
              <div className="text-[9px] text-emerald-300/60 uppercase tracking-wider">Conv.</div>
              <div>
                <div className="text-lg font-bold text-white">4.2%</div>
                <div className="w-full bg-emerald-900/30 rounded-full h-1 mt-1">
                  <div className="bg-emerald-400/70 h-1 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 motion-reduce:animate-none animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">98%</div>
                <div className="text-[7px] text-white/40">Uptime</div>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-500/15 flex items-center justify-center text-[10px]">&#9201;</div>
              <div>
                <div className="text-xs font-bold text-white">1.2s</div>
                <div className="text-[7px] text-white/40">Avg Load</div>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-500/15 flex items-center justify-center text-[10px]">&#9744;</div>
              <div>
                <div className="text-xs font-bold text-white">340</div>
                <div className="text-[7px] text-white/40">Tasks</div>
              </div>
            </div>
          </div>
        )}

        {page === "analytics" && (
          <div className="grid grid-cols-3 gap-2 h-[calc(100%-28px)]">
            {/* Chart area */}
            <div className="col-span-3 rounded-xl bg-gradient-to-br from-blue-600/15 to-indigo-600/10 border border-blue-500/15 p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[9px] text-blue-300/60 uppercase tracking-wider">Weekly Traffic</div>
                <div className="px-1.5 py-0.5 rounded bg-blue-500/15 text-[8px] text-blue-400">Live</div>
              </div>
              {/* Bar chart */}
              <div className="flex-1 flex items-end gap-1.5 px-1">
                {[65, 40, 80, 55, 90, 70, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-blue-500/40 to-blue-400/20 border border-blue-400/20 border-b-0"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[6px] text-white/30">
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Metric cards */}
            <div className="rounded-xl bg-gradient-to-br from-purple-600/15 to-violet-600/10 border border-purple-500/15 p-2.5">
              <div className="text-[8px] text-purple-300/60 uppercase tracking-wider">Visitors</div>
              <div className="text-lg font-bold text-white mt-1">14.2k</div>
              <div className="text-[8px] text-emerald-400 mt-0.5">+8.3%</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-cyan-600/15 to-teal-600/10 border border-cyan-500/15 p-2.5">
              <div className="text-[8px] text-cyan-300/60 uppercase tracking-wider">Bounce</div>
              <div className="text-lg font-bold text-white mt-1">32%</div>
              <div className="text-[8px] text-emerald-400 mt-0.5">-2.1%</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-600/15 to-orange-600/10 border border-amber-500/15 p-2.5">
              <div className="text-[8px] text-amber-300/60 uppercase tracking-wider">Avg Time</div>
              <div className="text-lg font-bold text-white mt-1">4:32</div>
              <div className="text-[8px] text-emerald-400 mt-0.5">+12s</div>
            </div>
          </div>
        )}

        {page === "users" && (
          <div className="flex flex-col gap-2 h-[calc(100%-28px)]">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5 flex items-center justify-between">
              <div className="text-[9px] text-white/50">Total Users</div>
              <div className="text-sm font-bold text-white">12,493</div>
            </div>
            {[
              { name: "Sarah Chen", role: "Admin", grad: "from-pink-400 to-rose-500", online: true },
              { name: "Alex Rivera", role: "Editor", grad: "from-blue-400 to-cyan-500", online: true },
              { name: "Jordan Lee", role: "Viewer", grad: "from-amber-400 to-orange-500", online: false },
              { name: "Maya Singh", role: "Editor", grad: "from-green-400 to-emerald-500", online: true },
              { name: "Tom Wilson", role: "Viewer", grad: "from-purple-400 to-violet-500", online: false },
            ].map((user) => (
              <div key={user.name} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2 flex items-center gap-2">
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${user.grad} text-[7px] text-white flex items-center justify-center font-bold`}>
                    {user.name[0]}
                  </div>
                  {user.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0c0c1d]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[9px] text-white/80 font-medium">{user.name}</div>
                  <div className="text-[7px] text-white/30">{user.role}</div>
                </div>
                <div className={`text-[7px] px-1.5 py-0.5 rounded ${user.online ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                  {user.online ? "Online" : "Offline"}
                </div>
              </div>
            ))}
          </div>
        )}

        {page === "settings" && (
          <div className="flex flex-col gap-2 h-[calc(100%-28px)]">
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="text-[9px] text-white/50 uppercase tracking-wider mb-2">General</div>
              {[
                { label: "Dark Mode", on: true },
                { label: "Notifications", on: true },
                { label: "Analytics", on: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5">
                  <span className="text-[9px] text-white/70">{s.label}</span>
                  <div className={`w-7 h-3.5 rounded-full relative ${s.on ? "bg-purple-500/50" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${s.on ? "right-0.5 bg-purple-400" : "left-0.5 bg-white/30"}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
              <div className="text-[9px] text-white/50 uppercase tracking-wider mb-2">Security</div>
              {[
                { label: "Two-Factor Auth", on: true },
                { label: "API Access", on: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-1.5">
                  <span className="text-[9px] text-white/70">{s.label}</span>
                  <div className={`w-7 h-3.5 rounded-full relative ${s.on ? "bg-purple-500/50" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all ${s.on ? "right-0.5 bg-purple-400" : "left-0.5 bg-white/30"}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-[7px] text-white flex items-center justify-center font-bold">N</div>
              <div>
                <div className="text-[9px] text-white/80 font-medium">Nexus Team</div>
                <div className="text-[7px] text-white/30">Pro Plan</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MANAGERS = ["npx", "bunx", "pnpm dlx"] as const;
type Manager = (typeof MANAGERS)[number];

interface SkillDetailActionsProps {
  repoShort: string;
}

export function SkillDetailActions({ repoShort }: SkillDetailActionsProps) {
  const [manager, setManager] = useState<Manager>("npx");
  const [copied, setCopied] = useState(false);

  const installCmd = `${manager} skills add ${repoShort}`;

  function handleCopy() {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Manager tabs */}
      <div className="flex gap-1 p-0.5 bg-white/[0.03] rounded-md w-fit">
        {MANAGERS.map((m) => (
          <button
            key={m}
            onClick={() => setManager(m)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer",
              m === manager
                ? "bg-surface text-foreground border border-border"
                : "text-muted-foreground/40 hover:text-foreground"
            )}
          >
            {m === "pnpm dlx" ? "pnpm" : m}
          </button>
        ))}
      </div>

      {/* Install command */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border bg-black/30 hover:border-neon/30 transition-colors group cursor-pointer"
      >
        <span className="font-mono text-[11px] truncate">
          <span className="text-neon/60">{manager}</span>{" "}
          <span className="text-foreground/80">skills add {repoShort}</span>
        </span>
        {copied ? (
          <Check size={14} className="text-emerald-400 shrink-0" />
        ) : (
          <Copy
            size={14}
            className="text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0"
          />
        )}
      </button>
    </div>
  );
}

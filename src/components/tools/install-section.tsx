"use client";

import { useState } from "react";
import { Terminal, Copy, Check, FolderTree, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-white/[0.05] text-muted-foreground/30 hover:text-neon/60 transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-lg border border-border bg-black/30 overflow-hidden">
      {label && (
        <div className="px-3 py-1.5 border-b border-border/30 flex items-center justify-between">
          <span className="text-[10px] font-mono text-muted-foreground/40">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="p-3 text-sm font-mono text-neon/70 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function InstallSection() {
  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          {"// "}РЪКОВОДСТВО
        </span>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
          <Terminal size={20} className="text-neon/50" />
          Как да използвате AI Skills
        </h2>
      </div>

      <div className="p-5 md:p-6 space-y-6">
        {/* Step 1: Install */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon/10 text-neon text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-bold text-foreground">
              Инсталирайте skill от GitHub
            </h3>
          </div>
          <CodeBlock
            code="npx skills add vercel-labs/agent-skills -y"
            label="terminal"
          />
          <p className="text-xs text-muted-foreground/50 mt-2">
            Командата изтегля SKILL.md файловете от GitHub и ги записва в{" "}
            <code className="text-neon/50">.claude/skills/</code> на проекта.
          </p>
        </div>

        {/* Step 2: Structure */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon/10 text-neon text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-bold text-foreground">
              Файлова структура
            </h3>
          </div>
          <div className="rounded-lg border border-border bg-black/30 p-4">
            <div className="space-y-1 text-sm font-mono text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <FolderTree size={14} className="text-neon/40" />
                <span className="text-foreground">.claude/skills/</span>
              </div>
              <div className="pl-6 flex items-center gap-2">
                <FolderTree size={12} className="text-neon/30" />
                <span>next-best-practices/</span>
              </div>
              <div className="pl-10 flex items-center gap-2">
                <FileCode size={12} className="text-neon/40" />
                <span className="text-neon/50">SKILL.md</span>
              </div>
              <div className="pl-6 flex items-center gap-2">
                <FolderTree size={12} className="text-neon/30" />
                <span>tailwind-design-system/</span>
              </div>
              <div className="pl-10 flex items-center gap-2">
                <FileCode size={12} className="text-neon/40" />
                <span className="text-neon/50">SKILL.md</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Create your own */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neon/10 text-neon text-xs font-bold">
              3
            </span>
            <h3 className="text-sm font-bold text-foreground">
              Или създайте собствен skill
            </h3>
          </div>
          <CodeBlock
            code={`---
name: my-custom-skill
description: Описание кога и как да се използва този skill
---

# Инструкции

Когато потребителят поиска [задача], следвай тези стъпки:

1. Анализирай текущия код
2. Приложи най-добрите практики
3. Верифицирай резултата`}
            label=".claude/skills/my-custom-skill/SKILL.md"
          />
          <p className="text-xs text-muted-foreground/50 mt-2">
            Създайте SKILL.md файл с YAML frontmatter (name, description) и Markdown инструкции.
            AI агентът автоматично ще открие и зареди skill-а при нужда.
          </p>
        </div>
      </div>
    </div>
  );
}

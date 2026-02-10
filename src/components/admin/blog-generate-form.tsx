"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Globe } from "lucide-react";
import { generateBlogPost } from "@/lib/blog-actions";
import { AI_MODELS } from "@/lib/content-engine/config";
import { toast } from "sonner";
import type { ContentType } from "@/types/admin";

const CONTENT_TYPES: { value: ContentType; label: string; description: string }[] = [
  { value: "tofu", label: "TOFU", description: "Top of Funnel \u2014 awareness" },
  { value: "mofu", label: "MOFU", description: "Middle of Funnel \u2014 consideration" },
  { value: "bofu", label: "BOFU", description: "Bottom of Funnel \u2014 conversion" },
  { value: "advertorial", label: "Advertorial", description: "Native ad format" },
];

const TEXT_MODELS = Object.entries(AI_MODELS)
  .filter(([, m]) => !m.strengths.includes("image-generation"))
  .map(([key, m]) => ({ key, id: m.id, name: m.name, cost: m.costPer1M }));

export function BlogGenerateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState<ContentType>("tofu");
  const [category, setCategory] = useState("");
  const [wordCount, setWordCount] = useState(1500);
  const [extraContext, setExtraContext] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [model, setModel] = useState(TEXT_MODELS[2]?.id || "google/gemini-3-flash-preview");

  function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Моля, въведете тема");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateBlogPost({
          topic: topic.trim(),
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          contentType,
          category: category.trim() || "general",
          targetWordCount: wordCount,
          extraContext: extraContext.trim() || undefined,
          useWebSearch,
          model,
        });
        toast.success(`Статия генерирана: ${result.title}`);
        router.push(`/admin/blog/${result.id}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Грешка при генерирането"
        );
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // AI ГЕНЕРАТОР
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          Нова статия
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI ще генерира пълна блог статия на база вашите параметри.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
        {/* Topic */}
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
            $ topic *
          </Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Напр: 5 начина да увеличите онлайн продажбите си"
            className="bg-background border-border focus:border-neon/50"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
            $ keywords (comma-separated)
          </Label>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="онлайн магазин, е-търговия, SEO"
            className="bg-background border-border focus:border-neon/50"
          />
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
            $ content_type
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CONTENT_TYPES.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                  contentType === ct.value
                    ? "border-neon/50 bg-neon/10 text-neon"
                    : "border-border bg-background text-muted-foreground hover:border-border/80"
                }`}
              >
                <span className="block font-mono">{ct.label}</span>
                <span className="block text-[10px] opacity-60 mt-0.5">
                  {ct.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category + Word Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
              $ category
            </Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="marketing"
              className="bg-background border-border focus:border-neon/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
              $ target_words
            </Label>
            <Input
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              min={500}
              max={5000}
              step={100}
              className="bg-background border-border focus:border-neon/50"
            />
          </div>
        </div>

        {/* AI Model */}
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
            $ ai_model
          </Label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-neon/50 focus:outline-none"
          >
            {TEXT_MODELS.map((m) => (
              <option key={m.key} value={m.id}>
                {m.name}{" "}
                {m.cost.output === 0
                  ? "(free)"
                  : `($${m.cost.output}/1M out)`}
              </option>
            ))}
          </select>
        </div>

        {/* Web Research Toggle */}
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
            $ web_research
          </Label>
          <button
            type="button"
            onClick={() => setUseWebSearch(!useWebSearch)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
              useWebSearch
                ? "border-neon/50 bg-neon/10 text-neon"
                : "border-border bg-background text-muted-foreground hover:border-border/80"
            }`}
          >
            <Globe size={18} className={useWebSearch ? "text-neon" : "text-muted-foreground"} />
            <div>
              <span className="block">
                {useWebSearch ? "\u0423\u0435\u0431 \u043F\u0440\u043E\u0443\u0447\u0432\u0430\u043D\u0435 \u2014 ON" : "\u0423\u0435\u0431 \u043F\u0440\u043E\u0443\u0447\u0432\u0430\u043D\u0435 \u2014 OFF"}
              </span>
              <span className="block text-[10px] opacity-60 mt-0.5">
                AI \u0449\u0435 \u043F\u043E\u0442\u044A\u0440\u0441\u0438 \u0430\u043A\u0442\u0443\u0430\u043B\u043D\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0432 \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442 \u043F\u0440\u0435\u0434\u0438 \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435\u0442\u043E
              </span>
            </div>
          </button>
        </div>

        {/* Extra Context */}
        <div className="space-y-2">
          <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
            $ extra_context (optional)
          </Label>
          <textarea
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            rows={3}
            placeholder="Допълнителен контекст, данни или инструкции за AI..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/50 focus:outline-none resize-none"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isPending || !topic.trim()}
          className="w-full bg-neon text-primary-foreground hover:bg-neon/90 font-semibold h-12 text-base"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              {useWebSearch
                ? "\u041F\u0440\u043E\u0443\u0447\u0432\u0430\u043D\u0435 + \u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435... (20-40 \u0441\u0435\u043A)"
                : "\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435... (15-30 \u0441\u0435\u043A)"}
            </>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Генерирай статия
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

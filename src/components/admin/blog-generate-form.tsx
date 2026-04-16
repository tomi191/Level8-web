"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Globe, Plus } from "lucide-react";
import { generateBlogPost } from "@/lib/blog-actions";
import { AI_MODELS } from "@/lib/content-engine/config";
import { toast } from "sonner";
import type { ContentType } from "@/types/admin";

// Потребителски етикети за съществуващите категории (добавят се при нужда)
const CATEGORY_LABELS: Record<string, string> = {
  "ai-tech": "AI & Технологии",
  "ai-news": "AI Новини",
  avtomatizaciya: "Автоматизация",
  "web-dev": "Уеб разработка",
  ecommerce: "E-commerce",
  marketing: "Маркетинг",
  biznes: "Бизнес",
  regulacii: "Регулации",
  harduer: "Хардуер",
  news: "Новини",
};

function labelFor(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug.replace(/-/g, " ");
}

// Превръща заглавието към kebab-case slug за DB (кирилица → латиница)
function toSlug(input: string): string {
  const translit: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
    ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .trim()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CONTENT_TYPES: { value: ContentType; label: string; description: string }[] = [
  { value: "tofu", label: "Привличане", description: "Осведоменост за проблема" },
  { value: "mofu", label: "Обмисляне", description: "Сравнение и оценка" },
  { value: "bofu", label: "Решение", description: "Готов за покупка" },
  { value: "advertorial", label: "Реклама", description: "Рекламна статия" },
];

const TEXT_MODELS = Object.entries(AI_MODELS)
  .filter(([, m]) => !m.strengths.includes("image-generation"))
  .map(([key, m]) => ({ key, id: m.id, name: m.name, cost: m.costPer1M }));

const NEW_CATEGORY_SENTINEL = "__new__";

interface BlogGenerateFormProps {
  existingCategories: string[];
}

export function BlogGenerateForm({ existingCategories }: BlogGenerateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState<ContentType>("tofu");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    existingCategories[0] ?? NEW_CATEGORY_SENTINEL
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [wordCount, setWordCount] = useState(1500);
  const [extraContext, setExtraContext] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [model, setModel] = useState(TEXT_MODELS[2]?.id || "google/gemini-3-flash-preview");

  const newCategorySlug = useMemo(() => toSlug(newCategoryName), [newCategoryName]);
  const isCreatingNew = selectedCategory === NEW_CATEGORY_SENTINEL;
  const duplicateWarning =
    isCreatingNew && newCategorySlug && existingCategories.includes(newCategorySlug)
      ? `Категория "${labelFor(newCategorySlug)}" вече съществува.`
      : null;

  function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Моля, въведете тема.");
      return;
    }

    let finalCategory = selectedCategory;
    if (isCreatingNew) {
      if (!newCategoryName.trim()) {
        toast.error("Моля, въведете име на новата категория.");
        return;
      }
      if (!newCategorySlug) {
        toast.error("Името на категорията трябва да съдържа букви или цифри.");
        return;
      }
      finalCategory = newCategorySlug;
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
          category: finalCategory,
          targetWordCount: wordCount,
          extraContext: extraContext.trim() || undefined,
          useWebSearch,
          model,
        });
        toast.success(`Статията е готова: ${result.title}`);
        router.push(`/admin/blog/${result.id}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Възникна грешка при генерирането."
        );
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // AI генератор
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          Нова статия
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Изкуственият интелект ще напише пълна блог статия по вашите параметри.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
        {/* Тема */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Тема <span className="text-neon">*</span>
          </Label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Напр.: 5 начина да увеличите онлайн продажбите си"
            className="bg-background border-border focus:border-neon/50"
          />
          <p className="text-xs text-muted-foreground/70">
            Заглавието или идеята на статията. AI ще я разшири в пълен текст.
          </p>
        </div>

        {/* Ключови думи */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Ключови думи
          </Label>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="онлайн магазин, електронна търговия, SEO"
            className="bg-background border-border focus:border-neon/50"
          />
          <p className="text-xs text-muted-foreground/70">
            Разделени със запетая. Помагат на AI да насочи съдържанието за SEO.
          </p>
        </div>

        {/* Тип на съдържанието */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Тип на съдържанието
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CONTENT_TYPES.map((ct) => (
              <button
                type="button"
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left ${
                  contentType === ct.value
                    ? "border-neon/50 bg-neon/10 text-neon"
                    : "border-border bg-background text-muted-foreground hover:border-border/80"
                }`}
              >
                <span className="block font-semibold">{ct.label}</span>
                <span className="block text-[10px] opacity-60 mt-0.5">
                  {ct.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Категория + брой думи */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Категория <span className="text-neon">*</span>
            </Label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-neon/50 focus:outline-none"
            >
              {existingCategories.map((slug) => (
                <option key={slug} value={slug}>
                  {labelFor(slug)}
                </option>
              ))}
              <option value={NEW_CATEGORY_SENTINEL}>
                ＋ Нова категория…
              </option>
            </select>

            {isCreatingNew && (
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-neon shrink-0" />
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Напр.: Финанси за малки фирми"
                    className="bg-background border-border focus:border-neon/50"
                    autoFocus
                  />
                </div>
                {newCategorySlug && (
                  <p className="text-[11px] text-muted-foreground/70 font-mono">
                    slug: {newCategorySlug}
                  </p>
                )}
                {duplicateWarning && (
                  <p className="text-[11px] text-orange-400">
                    {duplicateWarning}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Приблизителен брой думи
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

        {/* AI модел */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            AI модел
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
                  ? "(безплатен)"
                  : `($${m.cost.output} / 1 млн. токена изход)`}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground/70">
            Различните модели дават различно качество и цена.
          </p>
        </div>

        {/* Уеб проучване */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Уеб проучване
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
            <Globe
              size={18}
              className={useWebSearch ? "text-neon" : "text-muted-foreground"}
            />
            <div>
              <span className="block">
                {useWebSearch ? "Включено" : "Изключено"}
              </span>
              <span className="block text-[10px] opacity-60 mt-0.5">
                Преди да пише, AI ще търси актуална информация в интернет.
              </span>
            </div>
          </button>
        </div>

        {/* Допълнителен контекст */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">
            Допълнителен контекст (по желание)
          </Label>
          <textarea
            value={extraContext}
            onChange={(e) => setExtraContext(e.target.value)}
            rows={3}
            placeholder="Специфична информация, данни или указания към AI…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/50 focus:outline-none resize-none"
          />
        </div>

        {/* Генерирай */}
        <Button
          onClick={handleGenerate}
          disabled={isPending || !topic.trim()}
          className="w-full bg-neon text-primary-foreground hover:bg-neon/90 font-semibold h-12 text-base"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              {useWebSearch
                ? "Търся информация и пиша… (20–40 сек.)"
                : "Пиша статията… (15–30 сек.)"}
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

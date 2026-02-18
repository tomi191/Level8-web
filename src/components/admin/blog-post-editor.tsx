"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Save,
  Globe,
  Trash2,
  ImagePlus,
  Mic,
  Video,
  Share2,
  Eye,
  FileEdit,
  Clock,
  BookOpen,
  DollarSign,
  GlobeIcon,
  EyeOff,
  Search,
  ChevronDown,
  ChevronRight,
  Bell,
} from "lucide-react";
import {
  saveBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  deleteBlogPost,
  generateBlogImages,
  generateAudio,
  generateVideo,
  publishToSocial,
  sendToViber,
  sendPushForPost,
} from "@/lib/blog-actions";
import { toast } from "sonner";
import type { BlogPost } from "@/types/admin";

type Tab = "editor" | "preview";

export function BlogPostEditor({ post }: { post: BlogPost }) {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<Tab>("editor");
  const [form, setForm] = useState({
    title: post.title,
    slug: post.slug,
    meta_title: post.meta_title || "",
    meta_description: post.meta_description || "",
    excerpt: post.excerpt || "",
    content: post.content || "",
    category: post.category || "",
    keywords: (post.keywords || []).join(", "),
  });
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [audioProvider, setAudioProvider] = useState<"google" | "elevenlabs">("google");
  const [videoTopic, setVideoTopic] = useState(post.title);
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);
  const [seoOpen, setSeoOpen] = useState(true);

  // Local state for media URLs (update from server)
  const [featuredImage, setFeaturedImage] = useState(post.image);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [socialPosts, setSocialPosts] = useState<Record<string, unknown> | null>(null);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveBlogPost(post.id, {
          title: form.title,
          slug: form.slug,
          meta_title: form.meta_title || null,
          meta_description: form.meta_description || null,
          excerpt: form.excerpt || null,
          content: form.content || null,
          category: form.category || undefined,
          keywords: form.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        });
        toast.success("Запазено");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handlePublish() {
    startTransition(async () => {
      try {
        if (post.published) {
          await unpublishBlogPost(post.id);
          toast.success("Статията е скрита (draft)");
        } else {
          await publishBlogPost(post.id);
          toast.success("Статията е публикувана!");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази статия?")) return;
    startTransition(async () => {
      try {
        await deleteBlogPost(post.id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleGenerateBlogImages() {
    startTransition(async () => {
      try {
        const result = await generateBlogImages(post.id);
        setFeaturedImage(result.heroUrl);
        setContentImages([result.img1Url, result.img2Url]);
        setForm((prev) => ({ ...prev, content: result.updatedContent }));
        toast.success("3 изображения генерирани!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  function handleGenerateAudio() {
    startTransition(async () => {
      try {
        const result = await generateAudio(post.id, audioProvider);
        setAudioUrl(result.url);
        toast.success("Аудио генерирано!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleGenerateVideo() {
    startTransition(async () => {
      try {
        const result = await generateVideo(post.id, videoTopic);
        setVideoUrl(result.videoUrl);
        toast.success("Видео генерирано!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handlePublishSocial() {
    if (socialPlatforms.length === 0) {
      toast.error("Изберете поне една платформа");
      return;
    }
    startTransition(async () => {
      try {
        await publishToSocial(post.id, socialPlatforms);
        toast.success("Публикувано!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Грешка");
      }
    });
  }

  function handleSendViber() {
    startTransition(async () => {
      try {
        await sendToViber(post.id);
        toast.success("\u0418\u0437\u043F\u0440\u0430\u0442\u0435\u043D\u043E \u0432\u044A\u0432 Viber \u043A\u0430\u043D\u0430\u043B\u0430!");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 Viber");
      }
    });
  }

  function handleSendPush() {
    startTransition(async () => {
      try {
        const result = await sendPushForPost(post.id);
        toast.success(`Push \u0438\u0437\u043F\u0440\u0430\u0442\u0435\u043D\u043E \u0434\u043E ${result.sent} \u0430\u0431\u043E\u043D\u0430\u0442\u0438`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 Push");
      }
    });
  }

  function toggleSocialPlatform(p: string) {
    setSocialPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // {post.published ? "PUBLISHED" : "DRAFT"}
          </span>
          <h1 className="font-display text-xl font-bold text-foreground truncate max-w-lg">
            {form.title || "Без заглавие"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="border-border"
          >
            {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />}
            Запази
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPending}
            className={
              post.published
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-neon text-primary-foreground hover:bg-neon/90"
            }
          >
            {post.published ? (
              <>
                <EyeOff size={14} className="mr-1.5" />
                Скрий
              </>
            ) : (
              <>
                <Globe size={14} className="mr-1.5" />
                Публикувай
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <BookOpen size={12} />
          {post.word_count || 0} думи
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {post.read_time || 0} мин четене
        </span>
        {post.published && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-neon hover:underline"
          >
            <GlobeIcon size={12} />
            /blog/{post.slug}
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["editor", "preview"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-neon text-neon"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "editor" ? (
              <span className="flex items-center gap-1.5">
                <FileEdit size={14} />
                Редактор
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                Преглед
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          {tab === "editor" ? (
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground/70">$ title</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} className="bg-background border-border focus:border-neon/50 text-lg font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground/70">$ slug</Label>
                  <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="bg-background border-border focus:border-neon/50 font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground/70">$ category</Label>
                  <Input value={form.category} onChange={(e) => update("category", e.target.value)} className="bg-background border-border focus:border-neon/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs text-muted-foreground/70">$ content (HTML)</Label>
                <textarea value={form.content} onChange={(e) => update("content", e.target.value)} rows={20} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground font-mono focus:border-neon/50 focus:outline-none resize-y" />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-6">
              {featuredImage && (
                <img src={featuredImage} alt={form.title} className="w-full rounded-xl mb-6 max-h-80 object-cover" />
              )}
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                {form.title}
              </h1>
              {form.excerpt && (
                <p className="text-muted-foreground text-lg mb-6 italic">{form.excerpt}</p>
              )}
              <div
                className="prose prose-invert prose-neon max-w-none
                  prose-headings:font-display prose-headings:text-foreground
                  prose-a:text-neon prose-strong:text-foreground
                  prose-p:text-muted-foreground prose-li:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
              {audioUrl && (
                <div className="mt-8 p-4 rounded-xl border border-border bg-background">
                  <p className="text-xs font-mono text-muted-foreground mb-2">$ audio_player</p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar — SEO + Media generation */}
        <div className="space-y-4">
          {/* SEO / GEO Panel */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between font-mono text-xs text-neon/60 tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Search size={14} />
                SEO / GEO
              </span>
              {seoOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {seoOpen && (
              <div className="space-y-3">
                {/* Meta Title */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs text-muted-foreground/70">$ meta_title</Label>
                  <Input
                    value={form.meta_title}
                    onChange={(e) => update("meta_title", e.target.value)}
                    className="bg-background border-border focus:border-neon/50 text-sm"
                  />
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-mono ${
                      form.meta_title.length === 0
                        ? "text-muted-foreground/40"
                        : form.meta_title.length >= 50 && form.meta_title.length <= 60
                          ? "text-neon"
                          : form.meta_title.length > 60
                            ? "text-red-400"
                            : "text-amber-400"
                    }`}>
                      {form.meta_title.length}/60
                    </span>
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs text-muted-foreground/70">$ meta_description</Label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => update("meta_description", e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/50 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-mono ${
                      form.meta_description.length === 0
                        ? "text-muted-foreground/40"
                        : form.meta_description.length >= 150 && form.meta_description.length <= 160
                          ? "text-neon"
                          : form.meta_description.length > 160
                            ? "text-red-400"
                            : "text-amber-400"
                    }`}>
                      {form.meta_description.length}/160
                    </span>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs text-muted-foreground/70">$ keywords</Label>
                  <Input
                    value={form.keywords}
                    onChange={(e) => update("keywords", e.target.value)}
                    placeholder="keyword1, keyword2, ..."
                    className="bg-background border-border focus:border-neon/50 text-sm"
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs text-muted-foreground/70">$ excerpt</Label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => update("excerpt", e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/50 focus:outline-none resize-none"
                  />
                </div>

                {/* Google SERP Preview */}
                <div className="space-y-1.5">
                  <Label className="font-mono text-xs text-muted-foreground/70">Google Preview</Label>
                  <div className="rounded-lg border border-border bg-white p-3 space-y-0.5">
                    <p className="text-sm text-[#1a0dab] truncate leading-tight">
                      {form.meta_title || form.title || "Page Title"}
                    </p>
                    <p className="text-xs text-[#006621] truncate leading-tight">
                      level8.bg/blog/{form.slug}
                    </p>
                    <p className="text-xs text-[#545454] line-clamp-2 leading-relaxed">
                      {form.meta_description || form.excerpt || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Blog Images (auto-generated) */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <h3 className="font-mono text-xs text-neon/60 tracking-wider flex items-center gap-1.5">
              <ImagePlus size={14} />
              {"\u0418\u0417\u041E\u0411\u0420\u0410\u0416\u0415\u041D\u0418\u042F (3)"}
            </h3>
            {featuredImage && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground/50 font-mono">Hero</p>
                <img src={featuredImage} alt="Hero" className="w-full rounded-lg max-h-32 object-cover" />
              </div>
            )}
            {contentImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {contentImages.map((url, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-muted-foreground/50 font-mono mb-1">IMG:{i + 1}</p>
                    <img src={url} alt={`Image ${i + 1}`} className="w-full rounded-lg max-h-24 object-cover" />
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground/50">
              {"\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u043D\u043E \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0430 3 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0441\u043F\u043E\u0440\u0435\u0434 \u0441\u044A\u0434\u044A\u0440\u0436\u0430\u043D\u0438\u0435\u0442\u043E"}
            </p>
            <Button
              size="sm"
              onClick={handleGenerateBlogImages}
              disabled={isPending}
              className="w-full bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
            >
              {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <ImagePlus size={14} className="mr-1.5" />}
              {"\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u0439 3 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F"}
            </Button>
          </div>

          {/* Audio */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <h3 className="font-mono text-xs text-neon/60 tracking-wider flex items-center gap-1.5">
              <Mic size={14} />
              АУДИО
            </h3>
            {audioUrl && (
              <audio controls src={audioUrl} className="w-full" />
            )}
            <div className="flex gap-2">
              {(["google", "elevenlabs"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setAudioProvider(p)}
                  className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    audioProvider === p
                      ? "border-neon/50 bg-neon/10 text-neon"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {p === "google" ? "Google TTS" : "ElevenLabs"}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={handleGenerateAudio}
              disabled={isPending}
              className="w-full bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
            >
              {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Mic size={14} className="mr-1.5" />}
              Генерирай аудио
            </Button>
          </div>

          {/* Video */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <h3 className="font-mono text-xs text-neon/60 tracking-wider flex items-center gap-1.5">
              <Video size={14} />
              ВИДЕО
            </h3>
            {videoUrl && (
              <a href={videoUrl} target="_blank" className="text-xs text-neon hover:underline break-all">
                {videoUrl}
              </a>
            )}
            <Input
              value={videoTopic}
              onChange={(e) => setVideoTopic(e.target.value)}
              placeholder="Тема за видеото..."
              className="bg-background border-border focus:border-neon/50 text-xs"
            />
            <Button
              size="sm"
              onClick={handleGenerateVideo}
              disabled={isPending}
              className="w-full bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
            >
              {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Video size={14} className="mr-1.5" />}
              Генерирай видео
            </Button>
          </div>

          {/* Social Publishing */}
          <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
            <h3 className="font-mono text-xs text-neon/60 tracking-wider flex items-center gap-1.5">
              <Share2 size={14} />
              СОЦИАЛНИ МРЕЖИ
            </h3>
            {socialPosts && typeof socialPosts === "object" && Object.keys(socialPosts).length > 0 && (
              <div className="space-y-1">
                {Object.entries(socialPosts as Record<string, { success?: boolean; url?: string }>).map(([platform, data]) => (
                  <div key={platform} className="flex items-center gap-2 text-xs">
                    <span className={data.success ? "text-neon" : "text-red-400"}>
                      {data.success ? "\u2713" : "\u2717"}
                    </span>
                    <span className="text-muted-foreground">{platform}</span>
                    {data.url && (
                      <a href={data.url} target="_blank" className="text-neon hover:underline truncate">
                        Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              {["youtube", "instagram", "facebook_feed"].map((p) => (
                <label key={p} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={socialPlatforms.includes(p)}
                    onChange={() => toggleSocialPlatform(p)}
                    className="rounded border-border"
                  />
                  {p === "youtube" ? "YouTube Shorts" : p === "instagram" ? "Instagram Reels" : "Facebook Feed"}
                </label>
              ))}
            </div>
            <Button
              size="sm"
              onClick={handlePublishSocial}
              disabled={isPending || !videoUrl}
              className="w-full bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
            >
              {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Share2 size={14} className="mr-1.5" />}
              Публикувай
            </Button>
            {!videoUrl && (
              <p className="text-[10px] text-muted-foreground/50">Генерирайте видео първо</p>
            )}
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              <Button
                size="sm"
                onClick={handleSendViber}
                disabled={isPending}
                className="w-full bg-[#7360F2]/10 text-[#7360F2] border border-[#7360F2]/20 hover:bg-[#7360F2]/20"
              >
                {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Share2 size={14} className="mr-1.5" />}
                {"\u0418\u0437\u043F\u0440\u0430\u0442\u0438 \u0432\u044A\u0432 Viber"}
              </Button>
              <Button
                size="sm"
                onClick={handleSendPush}
                disabled={isPending}
                className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
              >
                {isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Bell size={14} className="mr-1.5" />}
                {"\u0418\u0437\u043F\u0440\u0430\u0442\u0438 Push"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { updateAgentConfig } from "@/lib/social-agent-actions";
import type { SocialAgentConfig, AllPlatforms } from "@/lib/social-agent/types";

interface SettingsFormProps {
  configs: SocialAgentConfig[];
}

const PLATFORM_TABS: { id: AllPlatforms; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "viber", label: "Viber" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
];

export function SocialSettingsForm({ configs }: SettingsFormProps) {
  const [activePlatform, setActivePlatform] = useState<AllPlatforms>("global");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const config = configs.find((c) => c.platform === activePlatform);

  const [systemPrompt, setSystemPrompt] = useState(config?.system_prompt || "");
  const [aiModel, setAiModel] = useState(config?.ai_model || "google/gemini-3-flash-preview");
  const [temperature, setTemperature] = useState(config?.temperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(config?.max_tokens ?? 500);
  const [autoRespondDms, setAutoRespondDms] = useState(config?.auto_respond_dms ?? true);
  const [autoRespondComments, setAutoRespondComments] = useState(config?.auto_respond_comments ?? false);
  const [maxPerHour, setMaxPerHour] = useState(config?.max_messages_per_hour ?? 20);
  const [escalationKeywords, setEscalationKeywords] = useState(
    (config?.escalation_keywords || []).join(", ")
  );

  // Sync state when switching tabs
  function switchPlatform(platform: AllPlatforms) {
    setActivePlatform(platform);
    const c = configs.find((cfg) => cfg.platform === platform);
    setSystemPrompt(c?.system_prompt || "");
    setAiModel(c?.ai_model || "google/gemini-3-flash-preview");
    setTemperature(c?.temperature ?? 0.7);
    setMaxTokens(c?.max_tokens ?? 500);
    setAutoRespondDms(c?.auto_respond_dms ?? true);
    setAutoRespondComments(c?.auto_respond_comments ?? false);
    setMaxPerHour(c?.max_messages_per_hour ?? 20);
    setEscalationKeywords((c?.escalation_keywords || []).join(", "));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateAgentConfig(activePlatform, {
        system_prompt: systemPrompt || null,
        ai_model: aiModel,
        temperature,
        max_tokens: maxTokens,
        auto_respond_dms: autoRespondDms,
        auto_respond_comments: autoRespondComments,
        max_messages_per_hour: maxPerHour,
        escalation_keywords: escalationKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {/* Platform tabs */}
      <div className="flex gap-2 border-b border-border/50 pb-3">
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchPlatform(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePlatform === tab.id
                ? "bg-neon/10 text-neon border border-neon/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* System Prompt */}
        <div>
          <label className="block text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
            System Prompt {activePlatform !== "global" && "(празно = наследява Global)"}
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:border-neon/30 focus:outline-none"
            rows={8}
            placeholder={activePlatform === "global" ? "System prompt за AI агента..." : "Остави празно за да наследи Global..."}
          />
        </div>

        {/* Model + Params */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
              AI Model
            </label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/30 focus:outline-none"
            >
              <option value="google/gemini-3-flash-preview">Gemini 3 Flash</option>
              <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
              <option value="deepseek/deepseek-chat">DeepSeek v3</option>
              <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
              Temperature ({temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 500)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRespondDms}
              onChange={(e) => setAutoRespondDms(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Auto-respond DMs</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRespondComments}
              onChange={(e) => setAutoRespondComments(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Auto-respond Comments</span>
          </label>
          <div>
            <label className="block text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
              Max/hour
            </label>
            <input
              type="number"
              value={maxPerHour}
              onChange={(e) => setMaxPerHour(parseInt(e.target.value) || 20)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Escalation Keywords */}
        <div>
          <label className="block text-xs font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
            Escalation Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={escalationKeywords}
            onChange={(e) => setEscalationKeywords(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-neon/30 focus:outline-none"
            placeholder="цена, оферта, среща, проблем..."
          />
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neon text-black font-bold text-sm hover:bg-neon/80 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Запази
          </button>
          {saved && (
            <span className="text-xs text-neon font-mono">Запазено!</span>
          )}
        </div>
      </div>
    </div>
  );
}

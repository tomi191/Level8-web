import { getAgentConfigs } from "@/lib/social-agent-actions";
import { SocialSettingsForm } from "@/components/admin/social-settings-form";

export default async function SocialSettingsPage() {
  const configs = await getAgentConfigs();

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // НАСТРОЙКИ
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          AI Agent настройки
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Конфигурация на AI модел, system prompt, rate limits и escalation.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 md:p-6">
        <SocialSettingsForm configs={configs} />
      </div>
    </div>
  );
}

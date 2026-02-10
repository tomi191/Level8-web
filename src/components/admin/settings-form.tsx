"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { updateSettings } from "@/lib/admin-actions";
import { toast } from "sonner";
import type { GeneralSettings, NotificationSettings } from "@/types/admin";

interface SettingsFormProps {
  general: GeneralSettings;
  notifications: NotificationSettings;
}

export function SettingsForm({ general, notifications }: SettingsFormProps) {
  const [gen, setGen] = useState(general);
  const [notif, setNotif] = useState(notifications);
  const [isPending, startTransition] = useTransition();

  function handleSaveGeneral() {
    startTransition(async () => {
      await updateSettings("general", gen as unknown as Record<string, unknown>);
      toast.success("Настройките са запазени");
    });
  }

  function handleSaveNotifications() {
    startTransition(async () => {
      await updateSettings("notifications", notif as unknown as Record<string, unknown>);
      toast.success("Нотификациите са запазени");
    });
  }

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ОСНОВНИ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Основни настройки
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="site_name"
              className="font-mono text-xs text-muted-foreground/70 tracking-wider"
            >
              $ site_name
            </Label>
            <Input
              id="site_name"
              value={gen.site_name}
              onChange={(e) => setGen({ ...gen, site_name: e.target.value })}
              className="bg-background border-border focus:border-neon/50"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="contact_email"
              className="font-mono text-xs text-muted-foreground/70 tracking-wider"
            >
              $ contact_email
            </Label>
            <Input
              id="contact_email"
              type="email"
              value={gen.contact_email}
              onChange={(e) =>
                setGen({ ...gen, contact_email: e.target.value })
              }
              className="bg-background border-border focus:border-neon/50"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="font-mono text-xs text-muted-foreground/70 tracking-wider"
            >
              $ phone
            </Label>
            <Input
              id="phone"
              value={gen.phone}
              onChange={(e) => setGen({ ...gen, phone: e.target.value })}
              className="bg-background border-border focus:border-neon/50"
            />
          </div>
          <Button
            onClick={handleSaveGeneral}
            disabled={isPending}
            className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold"
          >
            {isPending ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <Save size={14} className="mr-2" />
            )}
            Запази
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // НОТИФИКАЦИИ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Email нотификации
          </h2>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              key: "email_on_contact" as const,
              label: "Контактна форма",
              description: "Получавай имейл при ново запитване",
            },
            {
              key: "email_on_lead" as const,
              label: "Безплатен одит",
              description: "Получавай имейл при нова заявка за одит",
            },
            {
              key: "email_on_chat" as const,
              label: "Чатбот контакт",
              description: "Получавай имейл при нов контакт от чатбота",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                checked={notif[item.key]}
                onCheckedChange={(checked) =>
                  setNotif({ ...notif, [item.key]: checked })
                }
              />
            </div>
          ))}
          <Button
            onClick={handleSaveNotifications}
            disabled={isPending}
            className="bg-neon text-primary-foreground hover:bg-neon/90 font-semibold"
          >
            {isPending ? (
              <Loader2 size={14} className="mr-2 animate-spin" />
            ) : (
              <Save size={14} className="mr-2" />
            )}
            Запази
          </Button>
        </div>
      </div>
    </div>
  );
}

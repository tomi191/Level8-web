"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { createCrmService, updateCrmService } from "@/lib/crm-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CrmClientService, CrmClient, CrmWebsite } from "@/types/crm";
import Link from "next/link";

interface ServiceFormProps {
  mode: "create" | "edit";
  service?: CrmClientService;
  clients: Pick<CrmClient, "id" | "company_name">[];
  websites: Pick<CrmWebsite, "id" | "domain" | "client_id">[];
  defaultClientId?: string;
}

const SERVICE_TYPE_OPTIONS = [
  { value: "hosting", label: "Хостинг" },
  { value: "maintenance", label: "Поддръжка" },
  { value: "development", label: "Разработка" },
  { value: "seo", label: "SEO" },
  { value: "design", label: "Дизайн" },
  { value: "other", label: "Друго" },
];

const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Месечно" },
  { value: "quarterly", label: "Тримесечно" },
  { value: "yearly", label: "Годишно" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Активна" },
  { value: "paused", label: "Паузирана" },
  { value: "cancelled", label: "Отказана" },
];

export function ServiceForm({
  mode,
  service,
  clients,
  websites,
  defaultClientId,
}: ServiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedClientId, setSelectedClientId] = useState(
    service?.client_id ?? defaultClientId ?? ""
  );
  const [autoRenew, setAutoRenew] = useState(service?.auto_renew ?? true);

  const filteredWebsites = websites.filter(
    (w) => w.client_id === selectedClientId
  );

  function handleSubmit(formData: FormData) {
    formData.set("auto_renew", String(autoRenew));
    formData.set("price", formData.get("price") as string || "0");

    startTransition(async () => {
      try {
        if (mode === "edit" && service) {
          await updateCrmService(service.id, formData);
          toast.success("Услугата е обновена");
          router.push(`/admin/crm/services/${service.id}`);
        } else {
          const result = await createCrmService(formData);
          toast.success("Услугата е създадена");
          router.push(`/admin/crm/services/${result.id}`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href={
          mode === "edit" && service
            ? `/admin/crm/services/${service.id}`
            : "/admin/crm/services"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        {mode === "edit" ? "Към услугата" : "Към списъка"}
      </Link>

      <form action={handleSubmit} className="space-y-6">
        {/* Main info */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ОСНОВНИ ДАННИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Информация за услугата
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="name"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ name *
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={service?.name ?? ""}
                placeholder="Месечна поддръжка, SEO пакет..."
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label
                htmlFor="client_id"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ client_id *
              </Label>
              <select
                id="client_id"
                name="client_id"
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                <option value="">-- Избери клиент --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label
                htmlFor="website_id"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ website_id
              </Label>
              <select
                id="website_id"
                name="website_id"
                defaultValue={service?.website_id ?? ""}
                disabled={!selectedClientId}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground disabled:opacity-50"
                )}
              >
                <option value="">-- Избери сайт --</option>
                {filteredWebsites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Service type */}
            <div className="space-y-2">
              <Label
                htmlFor="service_type"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ service_type
              </Label>
              <select
                id="service_type"
                name="service_type"
                defaultValue={service?.service_type ?? "other"}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                {SERVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ status
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={service?.status ?? "active"}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Billing section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ФАКТУРИРАНЕ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Цена и цикъл
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ price *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={0.01}
                required
                defaultValue={service?.price ?? ""}
                placeholder="0.00"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label
                htmlFor="currency"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ currency
              </Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={service?.currency ?? "EUR"}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Billing cycle */}
            <div className="space-y-2">
              <Label
                htmlFor="billing_cycle"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ billing_cycle
              </Label>
              <select
                id="billing_cycle"
                name="billing_cycle"
                defaultValue={service?.billing_cycle ?? "monthly"}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                {BILLING_CYCLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto renew */}
            <div className="space-y-2 flex items-end">
              <label className="flex items-center gap-3 cursor-pointer h-9">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background text-neon focus:ring-neon/50"
                />
                <span className="text-sm text-foreground">
                  Автоматично подновяване
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Dates section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ДАТИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Период на услугата
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="start_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ start_date *
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                required
                defaultValue={
                  service?.start_date ??
                  new Date().toISOString().split("T")[0]
                }
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="end_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ end_date
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={service?.end_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="next_billing_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ next_billing_date
              </Label>
              <Input
                id="next_billing_date"
                name="next_billing_date"
                type="date"
                defaultValue={service?.next_billing_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // БЕЛЕЖКИ
            </span>
          </div>
          <div className="p-5">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={service?.notes ?? ""}
              placeholder="Вътрешни бележки..."
              rows={3}
              className="bg-background border-border focus:border-neon/50 resize-y"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href={
              mode === "edit" && service
                ? `/admin/crm/services/${service.id}`
                : "/admin/crm/services"
            }
          >
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground"
            >
              Отказ
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            className={cn(
              "bg-neon text-background hover:bg-neon/90 font-medium",
              "disabled:opacity-50"
            )}
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {mode === "edit" ? "Записване..." : "Създаване..."}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {mode === "edit" ? "Запази промените" : "Създай услуга"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

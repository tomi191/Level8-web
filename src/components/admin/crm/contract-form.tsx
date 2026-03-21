"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { createCrmContract, updateCrmContract } from "@/lib/crm-contracts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CrmContractWithClient } from "@/types/crm";
import Link from "next/link";

interface ContractFormProps {
  contract?: CrmContractWithClient;
  clients: { id: string; company_name: string }[];
  websites: { id: string; domain: string; client_id: string }[];
  parentId?: string;
}

const TYPE_OPTIONS = [
  { value: "maintenance", label: "Поддръжка" },
  { value: "development", label: "Разработка" },
  { value: "audit", label: "Одит" },
  { value: "other", label: "Друго" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR (\u20ac)" },
  { value: "BGN", label: "BGN (лв.)" },
  { value: "USD", label: "USD ($)" },
];

export function ContractForm({
  contract,
  clients,
  websites,
  parentId,
}: ContractFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!contract;

  const [selectedClientId, setSelectedClientId] = useState(
    contract?.client_id ?? ""
  );
  const [selectedType, setSelectedType] = useState(
    contract?.type ?? "maintenance"
  );
  const [autoRenew, setAutoRenew] = useState(contract?.auto_renew ?? true);
  const [techStackInput, setTechStackInput] = useState(
    contract?.tech_stack?.join(", ") ?? ""
  );
  const [variant, setVariant] = useState<"a" | "b" | "">(
    contract?.variant ?? ""
  );

  // Filter websites by selected client
  const filteredWebsites = websites.filter(
    (w) => w.client_id === selectedClientId
  );

  function handleSubmit(formData: FormData) {
    // Inject computed values
    formData.set("auto_renew", String(autoRenew));
    formData.set(
      "tech_stack_json",
      JSON.stringify(
        techStackInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
    if (variant) {
      formData.set("variant", variant);
    }
    if (parentId) {
      formData.set("parent_id", parentId);
    }

    startTransition(async () => {
      try {
        if (isEdit && contract) {
          await updateCrmContract(contract.id, formData);
          toast.success("Договорът е обновен");
          router.push(`/admin/crm/contracts/${contract.id}`);
        } else {
          const result = await createCrmContract(formData);
          toast.success(
            `Договор ${result.contract_number} е създаден`
          );
          router.push(`/admin/crm/contracts/${result.id}`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  const defaultTitle = parentId
    ? "Анекс към договор"
    : contract?.title ?? "";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={
          isEdit && contract
            ? `/admin/crm/contracts/${contract.id}`
            : "/admin/crm/contracts"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        {isEdit ? "Към договора" : "Към списъка"}
      </Link>

      <form action={handleSubmit} className="space-y-6">
        {/* Main info section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ОСНОВНИ ДАННИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Информация за договора
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                defaultValue={contract?.website_id ?? ""}
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

            {/* Type */}
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ type *
              </Label>
              <select
                id="type"
                name="type"
                required
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(
                    e.target.value as "maintenance" | "development" | "audit" | "other"
                  )
                }
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ title *
              </Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={defaultTitle}
                placeholder="Заглавие на договора"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="description"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ description
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={contract?.description ?? ""}
                placeholder="Кратко описание на договора"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* Financial section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ФИНАНСИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Финансови условия
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Variant (only for maintenance) */}
            {selectedType === "maintenance" && (
              <div className="space-y-2 md:col-span-2">
                <Label className="font-mono text-xs text-muted-foreground/70 tracking-wider">
                  $ variant
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="variant_radio"
                      value="a"
                      checked={variant === "a"}
                      onChange={() => setVariant("a")}
                      className="h-4 w-4 border-border bg-background text-neon focus:ring-neon/50"
                    />
                    <span className="text-sm text-foreground">
                      Вариант A (фиксирана месечна цена)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="variant_radio"
                      value="b"
                      checked={variant === "b"}
                      onChange={() => setVariant("b")}
                      className="h-4 w-4 border-border bg-background text-neon focus:ring-neon/50"
                    />
                    <span className="text-sm text-foreground">
                      Вариант B (часова ставка)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Monthly price */}
            <div className="space-y-2">
              <Label
                htmlFor="monthly_price"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ monthly_price
              </Label>
              <Input
                id="monthly_price"
                name="monthly_price"
                type="number"
                min={0}
                step={0.01}
                defaultValue={contract?.monthly_price ?? ""}
                placeholder="0.00"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Hourly rate */}
            <div className="space-y-2">
              <Label
                htmlFor="hourly_rate"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ hourly_rate
              </Label>
              <Input
                id="hourly_rate"
                name="hourly_rate"
                type="number"
                min={0}
                step={0.01}
                defaultValue={contract?.hourly_rate ?? 0}
                placeholder="0.00"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Included hours */}
            <div className="space-y-2">
              <Label
                htmlFor="included_hours"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ included_hours
              </Label>
              <Input
                id="included_hours"
                name="included_hours"
                type="number"
                min={0}
                step={1}
                defaultValue={contract?.included_hours ?? 0}
                placeholder="0"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Total amount */}
            <div className="space-y-2">
              <Label
                htmlFor="total_amount"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ total_amount
              </Label>
              <Input
                id="total_amount"
                name="total_amount"
                type="number"
                min={0}
                step={0.01}
                defaultValue={contract?.total_amount ?? ""}
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
              <select
                id="currency"
                name="currency"
                defaultValue={contract?.currency ?? "EUR"}
                className={cn(
                  "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                  "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                  "text-foreground"
                )}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // СРОКОВЕ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Срокове и условия
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Effective date */}
            <div className="space-y-2">
              <Label
                htmlFor="effective_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ effective_date
              </Label>
              <Input
                id="effective_date"
                name="effective_date"
                type="date"
                defaultValue={contract?.effective_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Expiry date */}
            <div className="space-y-2">
              <Label
                htmlFor="expiry_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ expiry_date
              </Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                defaultValue={contract?.expiry_date ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Minimum period */}
            <div className="space-y-2">
              <Label
                htmlFor="minimum_period_months"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ minimum_period_months
              </Label>
              <Input
                id="minimum_period_months"
                name="minimum_period_months"
                type="number"
                min={0}
                step={1}
                defaultValue={contract?.minimum_period_months ?? 6}
                placeholder="6"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Payment due day */}
            <div className="space-y-2">
              <Label
                htmlFor="payment_due_day"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ payment_due_day (1-28)
              </Label>
              <Input
                id="payment_due_day"
                name="payment_due_day"
                type="number"
                min={1}
                max={28}
                step={1}
                defaultValue={contract?.payment_due_day ?? 10}
                placeholder="10"
                className="bg-background border-border focus:border-neon/50 font-mono"
              />
            </div>

            {/* Auto renew */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
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

        {/* Platform section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ПЛАТФОРМА
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Платформа и технологии
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Platform name */}
            <div className="space-y-2">
              <Label
                htmlFor="platform_name"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ platform_name
              </Label>
              <Input
                id="platform_name"
                name="platform_name"
                defaultValue={contract?.platform_name ?? ""}
                placeholder="Next.js, WordPress, Shopify..."
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Platform URL */}
            <div className="space-y-2">
              <Label
                htmlFor="platform_url"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ platform_url
              </Label>
              <Input
                id="platform_url"
                name="platform_url"
                type="url"
                defaultValue={contract?.platform_url ?? ""}
                placeholder="https://example.com"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Tech stack */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="tech_stack_input"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ tech_stack (разделени със запетая)
              </Label>
              <Input
                id="tech_stack_input"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                placeholder="React, Node.js, PostgreSQL, Cloudflare..."
                className="bg-background border-border focus:border-neon/50"
              />
              {techStackInput && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {techStackInput
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-neon/10 text-neon text-xs font-mono border border-neon/20"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // БЕЛЕЖКИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Допълнителни бележки
            </h2>
          </div>
          <div className="p-5">
            <Textarea
              id="notes"
              name="notes"
              defaultValue={contract?.notes ?? ""}
              placeholder="Вътрешни бележки към договора..."
              rows={3}
              className="bg-background border-border focus:border-neon/50 resize-y"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href={
              isEdit && contract
                ? `/admin/crm/contracts/${contract.id}`
                : "/admin/crm/contracts"
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
                {isEdit ? "Записване..." : "Създаване..."}
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {isEdit ? "Запази промените" : "Създай договор"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

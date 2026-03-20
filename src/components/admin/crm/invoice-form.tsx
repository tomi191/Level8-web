"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft, Plus, X } from "lucide-react";
import { createCrmInvoice, updateCrmInvoice } from "@/lib/crm-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  CrmInvoice,
  CrmClient,
  CrmWebsite,
  InvoiceLineItem,
} from "@/types/crm";
import Link from "next/link";

interface InvoiceFormProps {
  mode: "create" | "edit";
  invoice?: CrmInvoice;
  clients: Pick<CrmClient, "id" | "company_name">[];
  websites: Pick<CrmWebsite, "id" | "domain" | "client_id">[];
  nextInvoiceNumber: string;
  defaultClientId?: string;
}

const EMPTY_LINE_ITEM: InvoiceLineItem = {
  description: "",
  qty: 1,
  unit_price: 0,
  total: 0,
};

const SERVICE_TYPE_OPTIONS = [
  { value: "", label: "-- Избери --" },
  { value: "hosting", label: "Хостинг" },
  { value: "maintenance", label: "Поддръжка" },
  { value: "development", label: "Разработка" },
  { value: "seo", label: "SEO" },
  { value: "design", label: "Дизайн" },
  { value: "other", label: "Друго" },
];

const RECURRING_INTERVAL_OPTIONS = [
  { value: "monthly", label: "Месечно" },
  { value: "quarterly", label: "Тримесечно" },
  { value: "yearly", label: "Годишно" },
];

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceForm({
  mode,
  invoice,
  clients,
  websites,
  nextInvoiceNumber,
  defaultClientId,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedClientId, setSelectedClientId] = useState(
    invoice?.client_id ?? defaultClientId ?? ""
  );
  const [isRecurring, setIsRecurring] = useState(
    invoice?.is_recurring ?? false
  );
  const [items, setItems] = useState<InvoiceLineItem[]>(
    invoice?.items && invoice.items.length > 0
      ? invoice.items
      : [{ ...EMPTY_LINE_ITEM }]
  );

  // Filter websites by selected client
  const filteredWebsites = websites.filter(
    (w) => w.client_id === selectedClientId
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = Math.round(subtotal * 0.2 * 100) / 100;
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

  const updateItem = useCallback(
    (
      index: number,
      field: keyof InvoiceLineItem,
      value: string | number
    ) => {
      setItems((prev) => {
        const next = [...prev];
        const item = { ...next[index] };

        if (field === "description") {
          item.description = value as string;
        } else if (field === "qty") {
          item.qty = Number(value) || 0;
        } else if (field === "unit_price") {
          item.unit_price = Number(value) || 0;
        }

        item.total = Math.round(item.qty * item.unit_price * 100) / 100;
        next[index] = item;
        return next;
      });
    },
    []
  );

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_LINE_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(formData: FormData) {
    // Inject calculated values and line items
    formData.set("amount", String(subtotal));
    formData.set("vat_amount", String(vatAmount));
    formData.set("total_amount", String(totalAmount));
    formData.set("is_recurring", String(isRecurring));
    formData.set("items_json", JSON.stringify(items));

    startTransition(async () => {
      try {
        if (mode === "edit" && invoice) {
          await updateCrmInvoice(invoice.id, formData);
          toast.success("Фактурата е обновена");
          router.push(`/admin/crm/invoices/${invoice.id}`);
        } else {
          const result = await createCrmInvoice(formData);
          toast.success(
            `Фактура ${result.invoice_number} е създадена`
          );
          router.push(`/admin/crm/invoices/${result.id}`);
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  const invoiceNumber =
    mode === "edit" ? invoice?.invoice_number : nextInvoiceNumber;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={
          mode === "edit" && invoice
            ? `/admin/crm/invoices/${invoice.id}`
            : "/admin/crm/invoices"
        }
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        {mode === "edit" ? "Към фактурата" : "Към списъка"}
      </Link>

      <form action={handleSubmit} className="space-y-6">
        {/* Invoice number display */}
        <div className="rounded-2xl border border-neon/20 bg-neon/5 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
                // НОМЕР НА ФАКТУРА
              </span>
              <span className="font-mono text-2xl font-bold text-neon mt-1 block">
                {invoiceNumber}
              </span>
            </div>
            <span className="font-mono text-[10px] text-neon/30">
              auto-generated
            </span>
          </div>
        </div>

        {/* Main info section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ОСНОВНИ ДАННИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Информация за фактурата
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
                defaultValue={invoice?.website_id ?? ""}
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
                defaultValue={invoice?.service_type ?? ""}
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

            {/* Due date */}
            <div className="space-y-2">
              <Label
                htmlFor="due_date"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ due_date *
              </Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                required
                defaultValue={invoice?.due_date ?? ""}
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
                defaultValue={invoice?.description ?? ""}
                placeholder="Кратко описание на фактурата"
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* Recurring section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // РЕКУРЕНТНОСТ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Периодично плащане
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Is recurring */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-background text-neon focus:ring-neon/50"
                />
                <span className="text-sm text-foreground">
                  Периодична фактура
                </span>
              </label>
            </div>

            {isRecurring && (
              <>
                {/* Recurring interval */}
                <div className="space-y-2">
                  <Label
                    htmlFor="recurring_interval"
                    className="font-mono text-xs text-muted-foreground/70 tracking-wider"
                  >
                    $ recurring_interval
                  </Label>
                  <select
                    id="recurring_interval"
                    name="recurring_interval"
                    defaultValue={invoice?.recurring_interval ?? "monthly"}
                    className={cn(
                      "h-9 w-full rounded-md border bg-background px-3 py-1 text-sm",
                      "border-border focus:border-neon/50 focus:outline-none focus:ring-[3px] focus:ring-ring/50",
                      "text-foreground"
                    )}
                  >
                    {RECURRING_INTERVAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden md:block" />
              </>
            )}

            {/* Period start */}
            <div className="space-y-2">
              <Label
                htmlFor="period_start"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ period_start
              </Label>
              <Input
                id="period_start"
                name="period_start"
                type="date"
                defaultValue={invoice?.period_start ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>

            {/* Period end */}
            <div className="space-y-2">
              <Label
                htmlFor="period_end"
                className="font-mono text-xs text-muted-foreground/70 tracking-wider"
              >
                $ period_end
              </Label>
              <Input
                id="period_end"
                name="period_end"
                type="date"
                defaultValue={invoice?.period_end ?? ""}
                className="bg-background border-border focus:border-neon/50"
              />
            </div>
          </div>
        </div>

        {/* Line items section */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ПОЗИЦИИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Редове на фактурата
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {/* Header row */}
            <div className="hidden md:grid md:grid-cols-[1fr_80px_120px_120px_40px] gap-3 pb-2 border-b border-border/30">
              <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                ОПИСАНИЕ
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                К-ВО
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                ЕД. ЦЕНА
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right">
                ОБЩО
              </span>
              <span />
            </div>

            {/* Item rows */}
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-[1fr_80px_120px_120px_40px] gap-3 items-start"
              >
                <Input
                  placeholder="Описание на позицията"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(idx, "description", e.target.value)
                  }
                  className="bg-background border-border focus:border-neon/50"
                />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="К-во"
                  value={item.qty || ""}
                  onChange={(e) =>
                    updateItem(idx, "qty", e.target.value)
                  }
                  className="bg-background border-border focus:border-neon/50 font-mono"
                />
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Ед. цена"
                  value={item.unit_price || ""}
                  onChange={(e) =>
                    updateItem(idx, "unit_price", e.target.value)
                  }
                  className="bg-background border-border focus:border-neon/50 font-mono"
                />
                <div className="flex items-center justify-end h-9 px-3 rounded-md border border-border/50 bg-background/50 font-mono text-sm text-muted-foreground">
                  {formatAmount(item.total)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(idx)}
                  disabled={items.length <= 1}
                  className="h-9 w-9 text-muted-foreground hover:text-red-400 disabled:opacity-30"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}

            {/* Add row button */}
            <button
              type="button"
              onClick={addItem}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium text-neon/70",
                "hover:text-neon transition-colors mt-2"
              )}
            >
              <Plus size={14} />
              Добави позиция
            </button>

            {/* Totals */}
            <div className="border-t border-border/50 pt-4 mt-4 space-y-2">
              <div className="flex justify-end items-center gap-8">
                <span className="text-sm text-muted-foreground">
                  Подсума:
                </span>
                <span className="font-mono text-sm text-foreground w-[140px] text-right">
                  {formatAmount(subtotal)} €
                </span>
              </div>
              <div className="flex justify-end items-center gap-8">
                <span className="text-sm text-muted-foreground">
                  ДДС (20%):
                </span>
                <span className="font-mono text-sm text-foreground w-[140px] text-right">
                  {formatAmount(vatAmount)} €
                </span>
              </div>
              <div className="flex justify-end items-center gap-8 pt-2 border-t border-border/30">
                <span className="text-base font-bold text-foreground">
                  Обща сума:
                </span>
                <span className="font-mono text-lg font-bold text-neon w-[140px] text-right">
                  {formatAmount(totalAmount)} €
                </span>
              </div>
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
              defaultValue={invoice?.notes ?? ""}
              placeholder="Вътрешни бележки към фактурата..."
              rows={3}
              className="bg-background border-border focus:border-neon/50 resize-y"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href={
              mode === "edit" && invoice
                ? `/admin/crm/invoices/${invoice.id}`
                : "/admin/crm/invoices"
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
                {mode === "edit" ? "Запази промените" : "Създай фактура"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

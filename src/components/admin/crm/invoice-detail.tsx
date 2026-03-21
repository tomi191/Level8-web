"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  CheckCircle,
  Printer,
  Calendar,
  CreditCard,
  RefreshCw,
  Plus,
  Archive,
  Trash2,
  StickyNote,
  Activity,
  Mail,
  Upload,
  FileCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markInvoicePaid, sendInvoiceEmail, uploadInvoicePdf, deleteInvoicePdf } from "@/lib/crm-actions";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { toast } from "sonner";
import type {
  CrmInvoiceWithClient,
  CrmActivityLog,
  InvoiceStatus,
  ActivityAction,
} from "@/types/crm";

interface InvoiceDetailProps {
  invoice: CrmInvoiceWithClient;
  activities: CrmActivityLog[];
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Чернова",
    className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
  pending: {
    label: "Чакаща",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  sent: {
    label: "Изпратена",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  paid: {
    label: "Платена",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  overdue: {
    label: "Просрочена",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  cancelled: {
    label: "Отменена",
    className:
      "border-gray-500/20 bg-gray-500/10 text-gray-400 line-through",
  },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  hosting: "Хостинг",
  maintenance: "Поддръжка",
  development: "Разработка",
  seo: "SEO",
  design: "Дизайн",
  other: "Друго",
};

const RECURRING_LABELS: Record<string, string> = {
  monthly: "Месечно",
  quarterly: "Тримесечно",
  yearly: "Годишно",
};

const ACTION_ICON_MAP: Record<
  ActivityAction,
  { icon: typeof Plus; iconClass: string }
> = {
  created: { icon: Plus, iconClass: "text-emerald-400 bg-emerald-500/10" },
  updated: { icon: Pencil, iconClass: "text-blue-400 bg-blue-500/10" },
  archived: { icon: Archive, iconClass: "text-amber-400 bg-amber-500/10" },
  deleted: { icon: Trash2, iconClass: "text-red-400 bg-red-500/10" },
  payment_received: {
    icon: CreditCard,
    iconClass: "text-neon bg-neon/10",
  },
  note_added: {
    icon: StickyNote,
    iconClass: "text-purple-400 bg-purple-500/10",
  },
  status_changed: {
    icon: StickyNote,
    iconClass: "text-blue-400 bg-blue-500/10",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return (
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " \u20ac"
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Току-що";
  if (diffMin < 60) return `Преди ${diffMin} мин`;
  if (diffHr < 24)
    return `Преди ${diffHr} ${diffHr === 1 ? "час" : "часа"}`;
  if (diffDays < 7)
    return `Преди ${diffDays} ${diffDays === 1 ? "ден" : "дни"}`;

  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
  });
}

export function InvoiceDetail({
  invoice,
  activities,
}: InvoiceDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusCfg = STATUS_CONFIG[invoice.status];
  const canMarkPaid =
    invoice.status === "pending" || invoice.status === "sent" || invoice.status === "overdue";
  const hasPdf = !!invoice.pdf_url;

  function handleMarkPaid() {
    startTransition(async () => {
      try {
        await markInvoicePaid(invoice.id);
        toast.success("Фактурата е маркирана като платена");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  function handleSendEmail() {
    startTransition(async () => {
      try {
        await sendInvoiceEmail(invoice.id);
        toast.success("Фактурата е изпратена по имейл");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("pdf", file);

    startTransition(async () => {
      try {
        await uploadInvoicePdf(invoice.id, fd);
        toast.success("PDF е качен успешно");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Грешка при качване");
      }
    });

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handlePdfDelete() {
    startTransition(async () => {
      try {
        await deleteInvoicePdf(invoice.id);
        toast.success("PDF е изтрит");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Грешка при изтриване");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/crm/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Всички фактури
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ФАКТУРА
          </span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Invoice info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground">
                  {invoice.invoice_number}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-mono", statusCfg.className)}
                >
                  {statusCfg.label}
                </Badge>
              </div>

              <Link
                href={`/admin/crm/clients/${invoice.crm_clients.id}`}
                className="text-sm text-muted-foreground hover:text-neon transition-colors inline-block"
              >
                {invoice.crm_clients.company_name}
              </Link>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar
                    size={14}
                    className="text-muted-foreground/40 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground/50">
                    Издадена:
                  </span>
                  {formatDate(invoice.issue_date)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar
                    size={14}
                    className="text-muted-foreground/40 shrink-0"
                  />
                  <span className="text-xs text-muted-foreground/50">
                    Падеж:
                  </span>
                  {formatDate(invoice.due_date)}
                </div>
                {invoice.paid_date && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle size={14} className="shrink-0" />
                    <span className="text-xs text-emerald-400/60">
                      Платена:
                    </span>
                    {formatDate(invoice.paid_date)}
                  </div>
                )}
                {invoice.notification_sent && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <Mail size={14} className="shrink-0" />
                    <span className="text-xs text-blue-400/60">
                      {"Изпратена:"}
                    </span>
                    {formatDate(invoice.notification_sent_at)}
                  </div>
                )}
                {invoice.service_type && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard
                      size={14}
                      className="text-muted-foreground/40 shrink-0"
                    />
                    {SERVICE_TYPE_LABELS[invoice.service_type] ??
                      invoice.service_type}
                  </div>
                )}
                {(invoice.period_start || invoice.period_end) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar
                      size={14}
                      className="text-muted-foreground/40 shrink-0"
                    />
                    <span className="text-xs text-muted-foreground/50">
                      Период:
                    </span>
                    {formatDate(invoice.period_start)} &ndash;{" "}
                    {formatDate(invoice.period_end)}
                  </div>
                )}
                {invoice.is_recurring && (
                  <div className="flex items-center gap-2 text-neon/70">
                    <RefreshCw size={14} className="shrink-0" />
                    {RECURRING_LABELS[invoice.recurring_interval ?? ""] ??
                      "Периодична"}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {canMarkPaid && (
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isPending}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
                    >
                      <CheckCircle size={14} className="mr-2" />
                      {"Маркирай платена"}
                    </Button>
                  }
                  title={"Маркиране като платена"}
                  description={`Сигурни ли сте, че искате да маркирате фактура ${invoice.invoice_number} като платена?`}
                  confirmLabel={"Потвърди плащане"}
                  variant="warning"
                  onConfirm={handleMarkPaid}
                  isPending={isPending}
                />
              )}
              {hasPdf && (
                <Button
                  onClick={handleSendEmail}
                  disabled={isPending}
                  variant="outline"
                  className="border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  <Mail size={14} className="mr-2" />
                  {isPending ? "Обработка..." : invoice.notification_sent ? "Изпрати отново" : "Изпрати на клиент"}
                </Button>
              )}
              <Link
                href={`/admin/crm/invoices/${invoice.id}/edit`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-neon/20 bg-neon/5",
                  "px-3 py-2 text-sm font-medium text-neon",
                  "hover:bg-neon/10 hover:border-neon/40 transition-colors"
                )}
              >
                <Pencil size={14} />
                Редактирай
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Line items card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ПОЗИЦИИ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Редове на фактурата
          </h2>
        </div>

        {invoice.items && invoice.items.length > 0 ? (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider w-[50px]">
                    #
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
                    ОПИСАНИЕ
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right">
                    К-ВО
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right hidden sm:table-cell">
                    ЕД. ЦЕНА
                  </TableHead>
                  <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right">
                    ОБЩО
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, idx) => (
                  <TableRow
                    key={idx}
                    className="border-border/30 hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground/40">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground text-right">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground text-right hidden sm:table-cell">
                      {formatAmount(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-foreground text-right">
                      {formatAmount(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="border-t border-border/50 px-5 py-4 space-y-2">
              <div className="flex justify-end items-center gap-8">
                <span className="text-sm text-muted-foreground">
                  Подсума:
                </span>
                <span className="font-mono text-sm text-foreground w-[140px] text-right">
                  {formatAmount(invoice.amount)}
                </span>
              </div>
              <div className="flex justify-end items-center gap-8">
                <span className="text-sm text-muted-foreground">
                  ДДС (20%):
                </span>
                <span className="font-mono text-sm text-foreground w-[140px] text-right">
                  {formatAmount(invoice.vat_amount)}
                </span>
              </div>
              <div className="flex justify-end items-center gap-8 pt-2 border-t border-border/30">
                <span className="text-base font-bold text-foreground">
                  Обща сума:
                </span>
                <span className="font-mono text-xl font-bold text-neon w-[140px] text-right">
                  {formatAmount(invoice.total_amount)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex justify-end items-center gap-8 pt-2">
              <span className="text-base font-bold text-foreground">
                Обща сума:
              </span>
              <span className="font-mono text-xl font-bold text-neon w-[140px] text-right">
                {formatAmount(invoice.total_amount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notes section */}
      {invoice.notes && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // БЕЛЕЖКИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Вътрешни бележки
            </h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {invoice.notes}
            </p>
          </div>
        </div>
      )}

      {/* PDF section */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            {"// PDF ДОКУМЕНТ"}
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            PDF файл (MicroInvest)
          </h2>
        </div>
        <div className="p-5">
          {hasPdf ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCheck size={18} />
                <span className="text-sm font-medium">PDF е качен</span>
              </div>
              <a
                href={`/api/crm/invoices/${invoice.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-border",
                  "px-3 py-2 text-sm font-medium text-foreground",
                  "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
                )}
              >
                <Printer size={14} />
                Изтегли PDF
              </a>
              <ConfirmDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                    disabled={isPending}
                  >
                    <X size={14} className="mr-1" />
                    Изтрий
                  </Button>
                }
                title="Изтриване на PDF"
                description="Сигурни ли сте, че искате да изтриете качения PDF файл?"
                confirmLabel="Изтрий PDF"
                variant="destructive"
                onConfirm={handlePdfDelete}
                isPending={isPending}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground/50 hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <Upload size={14} className="mr-1" />
                Замени
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <Upload size={28} className="text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground/50">
                Качете PDF от MicroInvest за да изпратите на клиента
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
              >
                <Upload size={14} className="mr-2" />
                {isPending ? "Качване..." : "Качи PDF"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Activity log */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // АКТИВНОСТ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            История
          </h2>
        </div>

        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <Activity
              size={28}
              className="mx-auto text-muted-foreground/20 mb-3"
            />
            <p className="font-mono text-sm text-muted-foreground/50">
              $ crm activity --entity=invoice
            </p>
            <p className="font-mono text-sm text-muted-foreground/50 mt-1">
              0 results found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {activities.map((activity) => {
              const config = ACTION_ICON_MAP[activity.action] ?? {
                icon: Activity,
                iconClass: "text-muted-foreground bg-muted-foreground/10",
              };
              const ActionIcon = config.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className={cn(
                      "rounded-lg p-1.5 shrink-0 mt-0.5",
                      config.iconClass
                    )}
                  >
                    <ActionIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      {activity.description || activity.action}
                    </p>
                    {activity.actor && (
                      <span className="text-[10px] text-muted-foreground/30 font-mono mt-0.5 block">
                        {activity.actor}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground/40 shrink-0 mt-0.5">
                    {formatRelativeTime(activity.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="font-mono text-sm text-neon animate-pulse">
            processing...
          </div>
        </div>
      )}
    </div>
  );
}

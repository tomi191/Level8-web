"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Send,
  FileSignature,
  Play,
  XCircle,
  Plus,
  Archive,
  Trash2,
  StickyNote,
  Activity,
  Upload,
  FileCheck,
  X,
  Printer,
  Globe,
  Cpu,
  CreditCard,
  RefreshCw,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateContractStatus,
  uploadContractPdf,
  deleteContractPdf,
  createServiceFromContract,
} from "@/lib/crm-contracts";
import { ConfirmDialog } from "@/components/admin/crm/confirm-dialog";
import { toast } from "sonner";
import type {
  CrmContractWithAnnexes,
  CrmContract,
  CrmActivityLog,
  ContractStatus,
  ContractType,
  ActivityAction,
} from "@/types/crm";

interface ContractDetailProps {
  contract: CrmContractWithAnnexes;
  activities: CrmActivityLog[];
}

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Чернова",
    className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
  sent: {
    label: "Изпратен",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  signed: {
    label: "Подписан",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  active: {
    label: "Активен",
    className: "border-neon/20 bg-neon/10 text-neon",
  },
  expired: {
    label: "Изтекъл",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
  terminated: {
    label: "Прекратен",
    className: "border-red-500/20 bg-red-500/10 text-red-400",
  },
};

const TYPE_CONFIG: Record<ContractType, { label: string; className: string }> =
  {
    maintenance: {
      label: "Поддръжка",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    },
    development: {
      label: "Разработка",
      className: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    },
    audit: {
      label: "Одит",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    },
    other: {
      label: "Друго",
      className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
    },
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

const VARIANT_LABELS: Record<string, string> = {
  a: "Вариант A (фиксирана цена)",
  b: "Вариант B (часова ставка)",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number | null): string {
  if (amount == null) return "\u2014";
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

export function ContractDetail({
  contract,
  activities,
}: ContractDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusCfg = STATUS_CONFIG[contract.status];
  const typeCfg = TYPE_CONFIG[contract.type];
  const hasPdf = !!contract.pdf_url;

  // Status transition buttons
  const canSend = contract.status === "draft";
  const canSign = contract.status === "sent";
  const canActivate = contract.status === "signed";
  const canTerminate =
    contract.status === "active" || contract.status === "signed";

  function handleStatusChange(newStatus: ContractStatus) {
    startTransition(async () => {
      try {
        await updateContractStatus(contract.id, newStatus);
        const labels: Record<ContractStatus, string> = {
          draft: "Чернова",
          sent: "Изпратен",
          signed: "Подписан",
          active: "Активен",
          expired: "Изтекъл",
          terminated: "Прекратен",
        };
        toast.success(`Статус променен на: ${labels[newStatus]}`);
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
        await uploadContractPdf(contract.id, fd);
        toast.success("PDF е качен успешно");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Грешка при качване"
        );
      }
    });

    e.target.value = "";
  }

  function handlePdfDelete() {
    startTransition(async () => {
      try {
        await deleteContractPdf(contract.id);
        toast.success("PDF е изтрит");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Грешка при изтриване"
        );
      }
    });
  }

  function handleCreateService() {
    startTransition(async () => {
      try {
        const serviceId = await createServiceFromContract(contract.id);
        toast.success("Услугата е създадена от договора");
        router.push(`/admin/crm/services/${serviceId}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/crm/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Всички договори
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ДОГОВОР
          </span>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Contract info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-mono text-2xl md:text-3xl font-bold text-foreground">
                  {contract.contract_number || "---"}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-mono", statusCfg.className)}
                >
                  {statusCfg.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-mono", typeCfg.className)}
                >
                  {typeCfg.label}
                </Badge>
              </div>

              <p className="text-base text-foreground font-medium">
                {contract.title}
              </p>

              <Link
                href={`/admin/crm/clients/${contract.crm_clients.id}`}
                className="text-sm text-muted-foreground hover:text-neon transition-colors inline-block"
              >
                {contract.crm_clients.company_name}
              </Link>

              {contract.description && (
                <p className="text-sm text-muted-foreground/70">
                  {contract.description}
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {canSend && (
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isPending}
                      className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
                    >
                      <Send size={14} className="mr-2" />
                      {"Изпрати"}
                    </Button>
                  }
                  title={"Изпращане на договор"}
                  description={`Маркирай договор ${contract.contract_number || contract.title} като изпратен?`}
                  confirmLabel={"Изпрати"}
                  variant="warning"
                  onConfirm={() => handleStatusChange("sent")}
                  isPending={isPending}
                />
              )}
              {canSign && (
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isPending}
                      className="bg-amber-600 text-white hover:bg-amber-700 font-medium"
                    >
                      <FileSignature size={14} className="mr-2" />
                      {"Подпиши"}
                    </Button>
                  }
                  title={"Подписване на договор"}
                  description={`Маркирай договор ${contract.contract_number || contract.title} като подписан?`}
                  confirmLabel={"Подпиши"}
                  variant="warning"
                  onConfirm={() => handleStatusChange("signed")}
                  isPending={isPending}
                />
              )}
              {canActivate && (
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isPending}
                      className="bg-neon/20 text-neon border border-neon/30 hover:bg-neon/30 font-medium"
                    >
                      <Play size={14} className="mr-2" />
                      {"Активирай"}
                    </Button>
                  }
                  title={"Активиране на договор"}
                  description={`Активирай договор ${contract.contract_number || contract.title}?`}
                  confirmLabel={"Активирай"}
                  variant="warning"
                  onConfirm={() => handleStatusChange("active")}
                  isPending={isPending}
                />
              )}
              {canTerminate && (
                <ConfirmDialog
                  trigger={
                    <Button
                      disabled={isPending}
                      variant="outline"
                      className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <XCircle size={14} className="mr-2" />
                      {"Прекрати"}
                    </Button>
                  }
                  title={"Прекратяване на договор"}
                  description={`Сигурни ли сте, че искате да прекратите договор ${contract.contract_number || contract.title}?`}
                  confirmLabel={"Прекрати"}
                  variant="destructive"
                  onConfirm={() => handleStatusChange("terminated")}
                  isPending={isPending}
                />
              )}
              <Link
                href={`/admin/crm/contracts/${contract.id}/edit`}
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

      {/* Details card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[11px] text-muted-foreground/40">
            $ crm contract --details
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Месечна цена:</span>
            <span className="text-sm font-mono text-foreground">
              {formatAmount(contract.monthly_price)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Часова ставка:</span>
            <span className="text-sm font-mono text-foreground">
              {formatAmount(contract.hourly_rate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Включени часове:</span>
            <span className="text-sm font-mono text-foreground">
              {contract.included_hours}ч/мес
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Обща сума:</span>
            <span className="text-sm font-mono text-foreground">
              {formatAmount(contract.total_amount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Падеж:</span>
            <span className="text-sm text-foreground">
              {contract.payment_due_day}-о число
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Мин. период:</span>
            <span className="text-sm text-foreground">
              {contract.minimum_period_months} мес.
            </span>
          </div>
          {contract.variant && (
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-muted-foreground/40 shrink-0" />
              <span className="text-xs text-muted-foreground/50">Вариант:</span>
              <span className="text-sm text-foreground">
                {VARIANT_LABELS[contract.variant] || contract.variant}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Автоподновяване:</span>
            <span className={cn("text-sm", contract.auto_renew ? "text-neon" : "text-muted-foreground")}>
              {contract.auto_renew ? "Да" : "Не"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-muted-foreground/40 shrink-0" />
            <span className="text-xs text-muted-foreground/50">Валута:</span>
            <span className="text-sm font-mono text-foreground">
              {contract.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Dates card */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ДАТИ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Времева линия
          </h2>
        </div>
        <div className="p-5">
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/50" />

            {[
              {
                label: "Създаден",
                date: contract.created_date,
                active: !!contract.created_date,
              },
              {
                label: "Изпратен",
                date: contract.sent_date,
                active: !!contract.sent_date,
              },
              {
                label: "Подписан",
                date: contract.signed_date,
                active: !!contract.signed_date,
              },
              {
                label: "Активен от",
                date: contract.effective_date,
                active: contract.status === "active",
              },
              {
                label: "Изтича",
                date: contract.expiry_date,
                active: false,
                warning: (() => {
                  if (!contract.expiry_date) return false;
                  const days = Math.ceil(
                    (new Date(contract.expiry_date).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return days <= 30 && days >= 0;
                })(),
                expired: (() => {
                  if (!contract.expiry_date) return false;
                  return new Date(contract.expiry_date) < new Date();
                })(),
              },
              {
                label: "Прекратен",
                date: contract.terminated_date,
                active: !!contract.terminated_date,
                destructive: true,
              },
            ].map((step, i) => (
              <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                <div
                  className={cn(
                    "absolute left-[-17px] mt-1.5 h-3.5 w-3.5 rounded-full border-2",
                    step.active
                      ? step.destructive
                        ? "border-red-400 bg-red-400/20"
                        : "border-neon bg-neon/20"
                      : step.warning
                        ? "border-amber-400 bg-amber-400/20"
                        : step.expired
                          ? "border-red-400 bg-red-400/20"
                          : "border-border bg-background"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-muted-foreground/50 block">
                    {step.label}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      step.active
                        ? step.destructive
                          ? "text-red-400"
                          : "text-foreground"
                        : step.warning
                          ? "text-amber-400"
                          : step.expired
                            ? "text-red-400"
                            : "text-muted-foreground/30"
                    )}
                  >
                    {formatDate(step.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform card */}
      {(contract.platform_name ||
        contract.platform_url ||
        (contract.tech_stack && contract.tech_stack.length > 0)) && (
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // ПЛАТФОРМА
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Технически детайли
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {contract.platform_name && (
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-muted-foreground/40 shrink-0" />
                <span className="text-xs text-muted-foreground/50">Платформа:</span>
                <span className="text-sm text-foreground">
                  {contract.platform_name}
                </span>
              </div>
            )}
            {contract.platform_url && (
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-muted-foreground/40 shrink-0" />
                <span className="text-xs text-muted-foreground/50">URL:</span>
                <a
                  href={contract.platform_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neon hover:underline"
                >
                  {contract.platform_url}
                </a>
              </div>
            )}
            {contract.tech_stack && contract.tech_stack.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground/50">Tech stack:</span>
                <div className="flex flex-wrap gap-1.5">
                  {contract.tech_stack.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-neon/10 text-neon text-xs font-mono border border-neon/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Annexes section */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
              // АНЕКСИ
            </span>
            <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
              Анекси към договора
            </h2>
          </div>
          <Link
            href={`/admin/crm/contracts/new?parentId=${contract.id}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-neon/20 bg-neon/5",
              "px-3 py-2 text-sm font-medium text-neon",
              "hover:bg-neon/10 hover:border-neon/40 transition-colors"
            )}
          >
            <Plus size={14} />
            Добави анекс
          </Link>
        </div>

        {contract.annexes.length === 0 ? (
          <div className="p-8 text-center">
            <FileSignature
              size={28}
              className="mx-auto text-muted-foreground/20 mb-3"
            />
            <p className="font-mono text-sm text-muted-foreground/50">
              $ crm annexes --parent={contract.contract_number || contract.id}
            </p>
            <p className="font-mono text-sm text-muted-foreground/50 mt-1">
              0 results found
            </p>
            <p className="text-xs text-muted-foreground/30 mt-3">
              Няма добавени анекси към този договор.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {contract.annexes.map((annex: CrmContract) => {
              const annexStatusCfg = STATUS_CONFIG[annex.status];
              return (
                <Link
                  key={annex.id}
                  href={`/admin/crm/contracts/${annex.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground">
                        {annex.contract_number || "---"}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono",
                          annexStatusCfg.className
                        )}
                      >
                        {annexStatusCfg.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground/50 block mt-0.5 truncate">
                      {annex.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground/40 shrink-0 ml-4">
                    {formatDate(annex.created_date)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF section */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            {"// PDF ДОКУМЕНТ"}
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            PDF файл на договора
          </h2>
        </div>
        <div className="p-5">
          {hasPdf ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCheck size={18} />
                <span className="text-sm font-medium">PDF е качен</span>
              </div>
              <a
                href={`/api/crm/contracts/${contract.id}/pdf`}
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
                Качете подписан PDF на договора
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

      {/* Actions section */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ДЕЙСТВИЯ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Допълнителни действия
          </h2>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          <ConfirmDialog
            trigger={
              <Button
                disabled={isPending}
                className="bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
              >
                <Zap size={14} className="mr-2" />
                {"Създай услуга от договора"}
              </Button>
            }
            title={"Създаване на услуга"}
            description={"Ще бъде създадена нова услуга от данните на този договор. Продължавате ли?"}
            confirmLabel={"Създай услуга"}
            variant="warning"
            onConfirm={handleCreateService}
            isPending={isPending}
          />
          <Link
            href={`/admin/crm/contracts/${contract.id}/edit`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border border-border",
              "px-3 py-2 text-sm font-medium text-foreground",
              "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
            )}
          >
            <Pencil size={14} />
            Редактирай
          </Link>
        </div>
      </div>

      {/* Notes section */}
      {contract.notes && (
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
              {contract.notes}
            </p>
          </div>
        </div>
      )}

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
              $ crm activity --entity=contract
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

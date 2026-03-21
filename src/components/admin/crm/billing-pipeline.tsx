"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
  Upload,
  Send,
  CheckCircle2,
  ChevronRight,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateDraftFromService, distributeInvoice } from "@/lib/crm-actions";
import type { BillingPipelineData, BillingPipelineItem } from "@/types/crm";

const CYCLE_LABELS: Record<string, string> = {
  monthly: "/мес",
  quarterly: "/3м",
  yearly: "/год",
};

function formatAmount(amount: number, currency: string): string {
  return `${new Intl.NumberFormat("bg-BG", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)} ${currency}`;
}

function DaysBadge({ days }: { days: number }) {
  const color =
    days <= 0
      ? "bg-red-500/15 text-red-400 border-red-500/20"
      : days <= 3
        ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
        : days <= 7
          ? "bg-neon/15 text-neon border-neon/20"
          : "bg-white/5 text-muted-foreground/60 border-border/50";

  const text =
    days <= 0
      ? "Днес!"
      : days === 1
        ? "Утре"
        : `${days}д`;

  return (
    <span className={cn("inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border", color)}>
      {text}
    </span>
  );
}

function PipelineCard({
  item,
  action,
}: {
  item: BillingPipelineItem;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-foreground truncate">
          {item.clientName}
        </span>
        <DaysBadge days={item.daysUntil} />
      </div>
      <p className="text-xs text-muted-foreground/50 truncate mb-1">
        {item.serviceName}
        {item.billingCycle && (
          <span className="text-muted-foreground/30">
            {" "}{CYCLE_LABELS[item.billingCycle] || ""}
          </span>
        )}
      </p>
      {item.domain && (
        <p className="text-[10px] font-mono text-muted-foreground/30 truncate mb-1">
          {item.domain}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-mono font-bold text-foreground">
          {formatAmount(item.amount, item.currency)}
        </span>
        {action}
      </div>
      {item.invoiceNumber && (
        <p className="text-[10px] font-mono text-neon/40 mt-1">
          {item.invoiceNumber}
        </p>
      )}
    </div>
  );
}

function PipelineColumn({
  title,
  icon: Icon,
  count,
  color,
  children,
}: {
  title: string;
  icon: React.ElementType;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("rounded-md p-1.5", color)}>
          <Icon size={14} />
        </div>
        <span className="text-xs font-medium text-foreground">{title}</span>
        <span className="text-[10px] font-mono text-muted-foreground/40 bg-white/5 rounded px-1.5 py-0.5">
          {count}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function BillingPipeline({ data }: { data: BillingPipelineData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleGenerateDraft(serviceId: string) {
    setLoadingId(serviceId);
    startTransition(async () => {
      try {
        const invoiceId = await generateDraftFromService(serviceId);
        router.push(`/admin/crm/invoices/${invoiceId}`);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Грешка");
      } finally {
        setLoadingId(null);
      }
    });
  }

  function handleDistribute(invoiceId: string) {
    setLoadingId(invoiceId);
    startTransition(async () => {
      try {
        await distributeInvoice(invoiceId);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Грешка");
      } finally {
        setLoadingId(null);
      }
    });
  }

  const formattedPaidTotal = formatAmount(data.paidThisMonthTotal, "EUR");

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // BILLING PIPELINE
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Фактуриране
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 size={14} className="text-emerald-400/60" />
          <span className="text-muted-foreground/50">
            Платени: <span className="text-emerald-400 font-mono font-bold">{data.paidThisMonth}</span>
          </span>
          <span className="text-muted-foreground/20">|</span>
          <span className="text-emerald-400 font-mono font-bold">{formattedPaidTotal}</span>
        </div>
      </div>

      {/* Pipeline columns */}
      <div className="p-5 overflow-x-auto">
        <div className="flex gap-4 min-w-[800px]">
          {/* 1. Предстоящи */}
          <PipelineColumn
            title="Предстоящи"
            icon={Clock}
            count={data.upcoming.length}
            color="bg-amber-500/10 text-amber-400"
          >
            {data.upcoming.slice(0, 5).map((item) => (
              <PipelineCard
                key={item.id}
                item={item}
                action={
                  <button
                    onClick={() => handleGenerateDraft(item.serviceId)}
                    disabled={isPending && loadingId === item.serviceId}
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded",
                      "border border-neon/20 text-neon bg-neon/5",
                      "hover:bg-neon/10 transition-colors",
                      "disabled:opacity-50"
                    )}
                  >
                    <FileText size={10} />
                    {isPending && loadingId === item.serviceId
                      ? "..."
                      : "Генерирай"}
                  </button>
                }
              />
            ))}
            {data.upcoming.length > 5 && (
              <p className="text-[10px] font-mono text-muted-foreground/30 text-center pt-1">
                +{data.upcoming.length - 5} още
              </p>
            )}
            {data.upcoming.length === 0 && (
              <p className="text-[10px] font-mono text-muted-foreground/20 py-4 text-center">
                Няма предстоящи
              </p>
            )}
          </PipelineColumn>

          {/* Separator */}
          <div className="flex items-center shrink-0 text-muted-foreground/10">
            <ChevronRight size={16} />
          </div>

          {/* 2. Чернови */}
          <PipelineColumn
            title="Чернови"
            icon={FileText}
            count={data.drafts.length}
            color="bg-blue-500/10 text-blue-400"
          >
            {data.drafts.slice(0, 5).map((item) => (
              <PipelineCard
                key={item.id}
                item={item}
                action={
                  <a
                    href={`/admin/crm/invoices/${item.invoiceId}`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                  >
                    <Upload size={10} />
                    Качи PDF
                  </a>
                }
              />
            ))}
            {data.drafts.length === 0 && (
              <p className="text-[10px] font-mono text-muted-foreground/20 py-4 text-center">
                Няма чернови
              </p>
            )}
          </PipelineColumn>

          {/* Separator */}
          <div className="flex items-center shrink-0 text-muted-foreground/10">
            <ChevronRight size={16} />
          </div>

          {/* 3. За изпращане */}
          <PipelineColumn
            title="За изпращане"
            icon={Send}
            count={data.readyToSend.length}
            color="bg-emerald-500/10 text-emerald-400"
          >
            {data.readyToSend.slice(0, 5).map((item) => (
              <PipelineCard
                key={item.id}
                item={item}
                action={
                  <button
                    onClick={() => item.invoiceId && handleDistribute(item.invoiceId)}
                    disabled={isPending && loadingId === item.invoiceId}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                  >
                    <Send size={10} />
                    {isPending && loadingId === item.invoiceId
                      ? "..."
                      : "Изпрати"}
                  </button>
                }
              />
            ))}
            {data.readyToSend.length === 0 && (
              <p className="text-[10px] font-mono text-muted-foreground/20 py-4 text-center">
                Няма за изпращане
              </p>
            )}
          </PipelineColumn>

          {/* Separator */}
          <div className="flex items-center shrink-0 text-muted-foreground/10">
            <ChevronRight size={16} />
          </div>

          {/* 4. Изпратени */}
          <PipelineColumn
            title="Изпратени"
            icon={Banknote}
            count={data.sent.length}
            color="bg-purple-500/10 text-purple-400"
          >
            {data.sent.slice(0, 5).map((item) => (
              <PipelineCard
                key={item.id}
                item={item}
                action={
                  <a
                    href={`/admin/crm/invoices/${item.invoiceId}`}
                    className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border border-purple-500/20 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                  >
                    <CheckCircle2 size={10} />
                    Детайли
                  </a>
                }
              />
            ))}
            {data.sent.length === 0 && (
              <p className="text-[10px] font-mono text-muted-foreground/20 py-4 text-center">
                Няма изпратени
              </p>
            )}
          </PipelineColumn>
        </div>
      </div>
    </div>
  );
}

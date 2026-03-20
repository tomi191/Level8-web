"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { CrmInvoiceWithClient } from "@/types/crm";

interface CrmOverdueAlertProps {
  invoices: CrmInvoiceWithClient[];
}

export function CrmOverdueAlert({ invoices }: CrmOverdueAlertProps) {
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (Number(inv.total_amount) || 0),
    0
  );

  const formattedTotal = new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalAmount);

  const oldestDueDate = invoices.reduce((oldest, inv) => {
    if (!oldest || inv.due_date < oldest) return inv.due_date;
    return oldest;
  }, "" as string);

  const daysOverdue = oldestDueDate
    ? Math.floor(
        (Date.now() - new Date(oldestDueDate).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        "border-red-500/30 bg-red-500/5"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-red-500/10 p-2.5 shrink-0">
          <AlertTriangle size={20} className="text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-bold text-red-400">
            {invoices.length === 1
              ? "1 просрочена фактура"
              : `${invoices.length} просрочени фактури`}
          </h3>

          <p className="text-sm text-red-400/70 mt-1">
            Обща сума:{" "}
            <span className="font-mono font-bold text-red-400">
              {formattedTotal} €
            </span>
            {daysOverdue > 0 && (
              <>
                {" "}
                &middot; Най-старата е просрочена от{" "}
                <span className="font-mono font-bold text-red-400">
                  {daysOverdue}
                </span>{" "}
                {daysOverdue === 1 ? "ден" : "дни"}
              </>
            )}
          </p>

          {/* List first 3 overdue invoices */}
          <div className="mt-3 space-y-1.5">
            {invoices.slice(0, 3).map((inv) => {
              const invDaysOverdue = Math.floor(
                (Date.now() - new Date(inv.due_date).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 text-sm text-red-400/60"
                >
                  <span className="font-mono text-xs text-red-400/40">
                    {inv.invoice_number}
                  </span>
                  <span className="truncate">
                    {inv.crm_clients?.company_name || "---"}
                  </span>
                  <span className="ml-auto font-mono text-xs shrink-0">
                    {Number(inv.total_amount).toFixed(2)} €
                  </span>
                  <span className="text-xs text-red-400/40 shrink-0">
                    ({invDaysOverdue}д)
                  </span>
                </div>
              );
            })}
            {invoices.length > 3 && (
              <p className="text-xs text-red-400/40 font-mono">
                + още {invoices.length - 3}...
              </p>
            )}
          </div>
        </div>

        <Link
          href="/admin/crm/invoices?status=overdue"
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-lg",
            "border border-red-500/20 bg-red-500/10 px-3 py-1.5",
            "text-xs font-bold text-red-400 uppercase tracking-wider",
            "hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
          )}
        >
          Преглед
        </Link>
      </div>
    </div>
  );
}

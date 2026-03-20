"use client";

import type { InvoiceLineItem } from "@/types/crm";

type InvoiceStatus = "draft" | "pending" | "sent" | "paid" | "overdue" | "cancelled";

interface PortalInvoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  description: string | null;
  items: InvoiceLineItem[];
  paid_date: string | null;
}

interface PortalViewProps {
  client: { id: string; company_name: string };
  invoices: PortalInvoice[];
  token: string;
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  draft: {
    label: "Чернова",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  pending: {
    label: "Очаква плащане",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  sent: {
    label: "Изпратена",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  paid: {
    label: "Платена",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  overdue: {
    label: "Просрочена",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
  cancelled: {
    label: "Анулирана",
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
  },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency = "BGN"): string {
  const labels: Record<string, string> = { BGN: "лв.", EUR: "\u20AC", USD: "$" };
  const suffix = labels[currency] ?? currency;
  return (
    new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) +
    " " +
    suffix
  );
}

export function PortalView({ client, invoices, token }: PortalViewProps) {
  const totalOwed = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-wider text-gray-900">LEVEL 8</span>
                <span className="text-xs text-gray-400 tracking-widest uppercase">
                  Клиентски портал
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {client.company_name}
              </p>
            </div>
            {totalOwed > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Дължима сума
                </p>
                <p className="text-xl font-bold text-gray-900 font-mono">
                  {formatAmount(totalOwed)}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Фактури
        </h2>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              Няма фактури.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Номер
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Дата
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Падеж
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Сума
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      Статус
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                      PDF
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => {
                    const cfg = STATUS_CONFIG[inv.status as InvoiceStatus] ?? STATUS_CONFIG.pending;
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(inv.issue_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(inv.due_date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 text-right">
                          {formatAmount(inv.total_amount, inv.currency)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={`/portal/${token}/invoice/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            PDF
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {invoices.map((inv) => {
                const cfg = STATUS_CONFIG[inv.status as InvoiceStatus] ?? STATUS_CONFIG.pending;
                return (
                  <div key={inv.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {inv.invoice_number}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {formatDate(inv.issue_date)} &mdash; Падеж: {formatDate(inv.due_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-gray-900">
                        {formatAmount(inv.total_amount, inv.currency)}
                      </span>
                      <a
                        href={`/portal/${token}/invoice/${inv.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Изтегли PDF
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-gray-400">
            ЛЕВЕЛ 8 ЕООД &bull; ЕИК 208697165 &bull; гр. Варна &bull; level8.bg
          </p>
        </div>
      </footer>
    </div>
  );
}

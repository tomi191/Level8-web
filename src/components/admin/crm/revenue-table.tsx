"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface RevenueRow {
  clientId: string;
  companyName: string;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  lastPaymentDate: string | null;
}

interface RevenueTableProps {
  data: RevenueRow[];
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RevenueTable({ data }: RevenueTableProps) {
  const totals = data.reduce(
    (acc, row) => ({
      paid: acc.paid + row.totalPaid,
      pending: acc.pending + row.totalPending,
      overdue: acc.overdue + row.totalOverdue,
      invoices: acc.invoices + row.invoiceCount,
    }),
    { paid: 0, pending: 0, overdue: 0, invoices: 0 }
  );

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-mono text-sm text-muted-foreground/50">
          $ crm revenue --by-client
        </p>
        <p className="font-mono text-sm text-muted-foreground/50 mt-1">
          0 results found
        </p>
        <p className="text-xs text-muted-foreground/30 mt-3">
          Няма фактури за показване.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
              КЛИЕНТ
            </TableHead>
            <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right">
              ПЛАТЕНО
            </TableHead>
            <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right hidden sm:table-cell">
              ЧАКАЩО
            </TableHead>
            <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-right hidden sm:table-cell">
              ПРОСРОЧЕНО
            </TableHead>
            <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider text-center hidden md:table-cell">
              БР. ФАКТУРИ
            </TableHead>
            <TableHead className="font-mono text-[10px] text-muted-foreground/50 tracking-wider hidden lg:table-cell">
              ПОСЛЕДНО ПЛАЩАНЕ
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.clientId}
              className="border-border/30 transition-colors hover:bg-white/[0.02]"
            >
              <TableCell>
                <Link
                  href={`/admin/crm/clients/${row.clientId}`}
                  className="text-sm text-foreground hover:text-neon transition-colors"
                >
                  {row.companyName}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-emerald-400">
                {formatAmount(row.totalPaid)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-amber-400 hidden sm:table-cell">
                {row.totalPending > 0 ? formatAmount(row.totalPending) : "\u2014"}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-red-400 hidden sm:table-cell">
                {row.totalOverdue > 0 ? formatAmount(row.totalOverdue) : "\u2014"}
              </TableCell>
              <TableCell className="text-center font-mono text-sm text-muted-foreground hidden md:table-cell">
                {row.invoiceCount}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                {formatDate(row.lastPaymentDate)}
              </TableCell>
            </TableRow>
          ))}

          {/* Totals row */}
          <TableRow className="border-t border-border bg-white/[0.02] hover:bg-white/[0.03]">
            <TableCell className="text-sm font-bold text-foreground">
              Общо
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-bold text-emerald-400">
              {formatAmount(totals.paid)}
              <span className="text-emerald-400/50 ml-1 text-xs">€</span>
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-bold text-amber-400 hidden sm:table-cell">
              {totals.pending > 0 ? formatAmount(totals.pending) : "\u2014"}
            </TableCell>
            <TableCell className="text-right font-mono text-sm font-bold text-red-400 hidden sm:table-cell">
              {totals.overdue > 0 ? formatAmount(totals.overdue) : "\u2014"}
            </TableCell>
            <TableCell className="text-center font-mono text-sm font-bold text-muted-foreground hidden md:table-cell">
              {totals.invoices}
            </TableCell>
            <TableCell className="hidden lg:table-cell" />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

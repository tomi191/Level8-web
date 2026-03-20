import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmInvoices } from "@/lib/crm-actions";
import { InvoiceList } from "@/components/admin/crm/invoice-list";
import { ExportButton } from "@/components/admin/crm/export-button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function CrmInvoicesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status } = await searchParams;

  const invoices = await getCrmInvoices({
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // CRM / ФАКТУРИ
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            Фактури
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} {invoices.length === 1 ? "фактура" : "фактури"} общо
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExportButton href="/api/crm/export/invoices" label="CSV" />
          <Link
            href="/admin/crm/invoices/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5",
              "px-4 py-2.5 text-sm font-medium text-neon",
              "hover:bg-neon/10 hover:border-neon/40 transition-colors"
            )}
          >
            <Plus size={16} />
            Нова фактура
          </Link>
        </div>
      </div>

      {/* Invoice list */}
      <InvoiceList invoices={invoices} />
    </div>
  );
}

import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmClients } from "@/lib/crm-actions";
import { ClientList } from "@/components/admin/crm/client-list";
import { ExportButton } from "@/components/admin/crm/export-button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function CrmClientsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, search } = await searchParams;

  const clients = await getCrmClients({
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // CRM / КЛИЕНТИ
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            Клиенти
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} {clients.length === 1 ? "клиент" : "клиента"} общо
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ExportButton href="/api/crm/export/clients" label="CSV" />
          <Link
            href="/admin/crm/clients/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5",
              "px-4 py-2.5 text-sm font-medium text-neon",
              "hover:bg-neon/10 hover:border-neon/40 transition-colors"
            )}
          >
            <Plus size={16} />
            Нов клиент
          </Link>
        </div>
      </div>

      {/* Client list */}
      <ClientList clients={clients} />
    </div>
  );
}

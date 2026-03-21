import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmContracts } from "@/lib/crm-contracts";
import { ContractList } from "@/components/admin/crm/contract-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string }>;
}

export default async function CrmContractsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, type } = await searchParams;

  const contracts = await getCrmContracts({
    status: status || undefined,
    type: type || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // CRM / ДОГОВОРИ
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            Договори
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {contracts.length}{" "}
            {contracts.length === 1 ? "договор" : "договори"} общо
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/crm/contracts/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5",
              "px-4 py-2.5 text-sm font-medium text-neon",
              "hover:bg-neon/10 hover:border-neon/40 transition-colors"
            )}
          >
            <Plus size={16} />
            Нов договор
          </Link>
        </div>
      </div>

      {/* Contract list */}
      <ContractList contracts={contracts} />
    </div>
  );
}

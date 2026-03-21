import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmClients, getCrmWebsites } from "@/lib/crm-actions";
import { ContractForm } from "@/components/admin/crm/contract-form";

interface PageProps {
  searchParams: Promise<{ parentId?: string }>;
}

export default async function NewContractPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { parentId } = await searchParams;

  const [clients, websites] = await Promise.all([
    getCrmClients(),
    getCrmWebsites(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / ДОГОВОРИ / {parentId ? "НОВ АНЕКС" : "НОВ"}
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {parentId ? "Нов анекс" : "Нов договор"}
        </h1>
      </div>

      <ContractForm
        clients={clients.map((c) => ({
          id: c.id,
          company_name: c.company_name,
        }))}
        websites={websites.map((w) => ({
          id: w.id,
          domain: w.domain,
          client_id: w.client_id,
        }))}
        parentId={parentId}
      />
    </div>
  );
}

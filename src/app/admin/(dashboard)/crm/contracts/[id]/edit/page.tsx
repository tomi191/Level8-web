import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmContract } from "@/lib/crm-contracts";
import { getCrmClients, getCrmWebsites } from "@/lib/crm-actions";
import { ContractForm } from "@/components/admin/crm/contract-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContractPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [contract, clients, websites] = await Promise.all([
    getCrmContract(id),
    getCrmClients(),
    getCrmWebsites(),
  ]);

  if (!contract) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / ДОГОВОРИ / РЕДАКТИРАНЕ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {contract.contract_number || contract.title}
        </h1>
      </div>

      <ContractForm
        contract={contract}
        clients={clients.map((c) => ({
          id: c.id,
          company_name: c.company_name,
        }))}
        websites={websites.map((w) => ({
          id: w.id,
          domain: w.domain,
          client_id: w.client_id,
        }))}
      />
    </div>
  );
}

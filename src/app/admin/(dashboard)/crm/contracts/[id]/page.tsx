import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmContractWithAnnexes } from "@/lib/crm-contracts";
import { getEntityActivity } from "@/lib/crm-actions";
import { ContractDetail } from "@/components/admin/crm/contract-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [contract, activities] = await Promise.all([
    getCrmContractWithAnnexes(id),
    getEntityActivity("contract", id),
  ]);

  if (!contract) {
    notFound();
  }

  return <ContractDetail contract={contract} activities={activities} />;
}

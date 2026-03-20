import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCrmClient,
  getClientWebsites,
  getClientInvoices,
  getClientServices,
  getEntityActivity,
} from "@/lib/crm-actions";
import { ClientDetail } from "@/components/admin/crm/client-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [client, websites, invoices, services, activities] = await Promise.all([
    getCrmClient(id),
    getClientWebsites(id),
    getClientInvoices(id),
    getClientServices(id),
    getEntityActivity("client", id),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <ClientDetail
      client={client}
      websites={websites}
      invoices={invoices}
      services={services}
      activities={activities}
    />
  );
}

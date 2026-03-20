import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmService, getEntityActivity } from "@/lib/crm-actions";
import { ServiceDetail } from "@/components/admin/crm/service-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [service, activities] = await Promise.all([
    getCrmService(id),
    getEntityActivity("service", id),
  ]);

  if (!service) {
    notFound();
  }

  return <ServiceDetail service={service} activities={activities} />;
}

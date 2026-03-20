import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmService, getCrmClients, getCrmWebsites } from "@/lib/crm-actions";
import { ServiceForm } from "@/components/admin/crm/service-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [service, clients, websites] = await Promise.all([
    getCrmService(id),
    getCrmClients(),
    getCrmWebsites(),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / УСЛУГИ / РЕДАКТИРАНЕ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {service.name}
        </h1>
      </div>

      <ServiceForm
        mode="edit"
        service={service}
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
        websites={websites.map((w) => ({
          id: w.id,
          domain: w.domain,
          client_id: w.client_id,
        }))}
      />
    </div>
  );
}

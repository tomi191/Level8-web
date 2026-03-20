import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmClients, getCrmWebsites } from "@/lib/crm-actions";
import { ServiceForm } from "@/components/admin/crm/service-form";

interface PageProps {
  searchParams: Promise<{ client_id?: string }>;
}

export default async function NewServicePage({ searchParams }: PageProps) {
  await requireAdmin();
  const { client_id } = await searchParams;

  const [clients, websites] = await Promise.all([
    getCrmClients(),
    getCrmWebsites(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / УСЛУГИ / НОВА
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          Нова услуга
        </h1>
      </div>

      <ServiceForm
        mode="create"
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
        websites={websites.map((w) => ({
          id: w.id,
          domain: w.domain,
          client_id: w.client_id,
        }))}
        defaultClientId={client_id}
      />
    </div>
  );
}

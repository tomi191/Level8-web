import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmClients } from "@/lib/crm-actions";
import { WebsiteForm } from "@/components/admin/crm/website-form";

interface PageProps {
  searchParams: Promise<{ client_id?: string }>;
}

export default async function NewWebsitePage({ searchParams }: PageProps) {
  await requireAdmin();
  const { client_id } = await searchParams;

  const clients = await getCrmClients();

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / САЙТОВЕ / НОВ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          Нов сайт
        </h1>
      </div>

      <WebsiteForm
        mode="create"
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
        defaultClientId={client_id}
      />
    </div>
  );
}

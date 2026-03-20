import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmWebsite, getCrmClients } from "@/lib/crm-actions";
import { WebsiteForm } from "@/components/admin/crm/website-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWebsitePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [website, clients] = await Promise.all([
    getCrmWebsite(id),
    getCrmClients(),
  ]);

  if (!website) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / САЙТОВЕ / РЕДАКТИРАНЕ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {website.domain}
        </h1>
      </div>

      <WebsiteForm
        mode="edit"
        website={website}
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmClient } from "@/lib/crm-actions";
import { ClientForm } from "@/components/admin/crm/client-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const client = await getCrmClient(id);
  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / КЛИЕНТИ / РЕДАКТИРАНЕ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {client.company_name}
        </h1>
      </div>

      <ClientForm mode="edit" client={client} />
    </div>
  );
}

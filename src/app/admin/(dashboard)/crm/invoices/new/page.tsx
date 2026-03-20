import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCrmClients,
  getNextInvoiceNumber,
  getCrmWebsites,
} from "@/lib/crm-actions";
import { InvoiceForm } from "@/components/admin/crm/invoice-form";

interface PageProps {
  searchParams: Promise<{ client_id?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  await requireAdmin();
  const { client_id } = await searchParams;

  const [clients, nextInvoiceNumber, websites] = await Promise.all([
    getCrmClients(),
    getNextInvoiceNumber(),
    getCrmWebsites(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / ФАКТУРИ / НОВА
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          Нова фактура
        </h1>
      </div>

      <InvoiceForm
        mode="create"
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
        websites={websites.map((w) => ({
          id: w.id,
          domain: w.domain,
          client_id: w.client_id,
        }))}
        nextInvoiceNumber={nextInvoiceNumber}
        defaultClientId={client_id}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCrmInvoice,
  getCrmClients,
  getCrmWebsites,
} from "@/lib/crm-actions";
import { InvoiceForm } from "@/components/admin/crm/invoice-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [invoice, clients, websites] = await Promise.all([
    getCrmInvoice(id),
    getCrmClients(),
    getCrmWebsites(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / ФАКТУРИ / РЕДАКТИРАНЕ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          {invoice.invoice_number}
        </h1>
      </div>

      <InvoiceForm
        mode="edit"
        invoice={invoice}
        clients={clients.map((c) => ({ id: c.id, company_name: c.company_name }))}
        websites={websites.map((w) => ({
          id: w.id,
          domain: w.domain,
          client_id: w.client_id,
        }))}
        nextInvoiceNumber={invoice.invoice_number}
      />
    </div>
  );
}

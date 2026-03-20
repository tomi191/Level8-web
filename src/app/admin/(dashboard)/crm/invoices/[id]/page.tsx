import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmInvoice, getEntityActivity } from "@/lib/crm-actions";
import { InvoiceDetail } from "@/components/admin/crm/invoice-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [invoice, activities] = await Promise.all([
    getCrmInvoice(id),
    getEntityActivity("invoice", id),
  ]);

  if (!invoice) {
    notFound();
  }

  return <InvoiceDetail invoice={invoice} activities={activities} />;
}

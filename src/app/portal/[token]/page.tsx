import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { PortalView } from "@/components/portal/portal-view";
import type { InvoiceLineItem } from "@/types/crm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ClientPortalPage({ params }: PageProps) {
  const { token } = await params;

  // Validate UUID format to prevent unnecessary DB queries
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    notFound();
  }

  // Use service role client since this is a public page bypassing RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: client } = await admin
    .from("crm_clients")
    .select("id, company_name")
    .eq("portal_token", token)
    .single();

  if (!client) notFound();

  const { data: invoices } = await admin
    .from("crm_invoices")
    .select("id, invoice_number, issue_date, due_date, amount, vat_amount, total_amount, currency, status, description, items, paid_date")
    .eq("client_id", client.id)
    .eq("is_archived", false)
    .order("issue_date", { ascending: false });

  // Cast items from JSON
  const typedInvoices = (invoices ?? []).map((inv) => ({
    ...inv,
    items: (inv.items as unknown as InvoiceLineItem[]) ?? [],
  }));

  return <PortalView client={client} invoices={typedInvoices} token={token} />;
}

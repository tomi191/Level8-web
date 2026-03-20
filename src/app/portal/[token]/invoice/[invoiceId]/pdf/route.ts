import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; invoiceId: string }> }
) {
  const { token, invoiceId } = await params;

  // Validate UUID formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token) || !uuidRegex.test(invoiceId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Use service role client — this is a public route
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify token belongs to a client
  const { data: client } = await admin
    .from("crm_clients")
    .select("id")
    .eq("portal_token", token)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch invoice — ensure it belongs to this client
  const { data: invoice } = await admin
    .from("crm_invoices")
    .select("invoice_number, pdf_url")
    .eq("id", invoiceId)
    .eq("client_id", client.id)
    .eq("is_archived", false)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!invoice.pdf_url) {
    return NextResponse.json(
      { error: "No PDF available for this invoice" },
      { status: 404 }
    );
  }

  // Download from Supabase Storage (using service role for access)
  const { data: pdfBlob, error: downloadError } = await admin.storage
    .from("crm-invoices")
    .download(invoice.pdf_url);

  if (downloadError || !pdfBlob) {
    return NextResponse.json(
      { error: "Failed to download PDF" },
      { status: 500 }
    );
  }

  const arrayBuffer = await pdfBlob.arrayBuffer();

  return new NextResponse(new Uint8Array(arrayBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-cache",
    },
  });
}

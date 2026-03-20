import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check via cookies
  const cookieStore = await cookies();
  const db = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch invoice
  const { data: invoice, error } = await db
    .from("crm_invoices")
    .select("invoice_number, pdf_url")
    .eq("id", id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!invoice.pdf_url) {
    return NextResponse.json(
      { error: "No PDF uploaded for this invoice" },
      { status: 404 }
    );
  }

  // Download from Supabase Storage
  const { data: pdfBlob, error: downloadError } = await db.storage
    .from("crm-invoices")
    .download(invoice.pdf_url);

  if (downloadError || !pdfBlob) {
    return NextResponse.json(
      { error: `Failed to download PDF: ${downloadError?.message}` },
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

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function GET() {
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
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: invoices } = await db
    .from("crm_invoices")
    .select("*, crm_clients(company_name, eik)")
    .order("issue_date", { ascending: false });

  if (!invoices || invoices.length === 0) {
    return new Response("No data", { status: 404 });
  }

  // CSV header
  const headers = [
    "Номер",
    "Клиент",
    "ЕИК",
    "Дата",
    "Падеж",
    "Сума",
    "ДДС",
    "Общо",
    "Статус",
    "Платена на",
    "Тип",
    "Описание",
  ];

  const rows = invoices.map((inv) => {
    const client = inv.crm_clients as unknown as {
      company_name: string;
      eik: string | null;
    };
    return [
      inv.invoice_number,
      client?.company_name || "",
      client?.eik || "",
      inv.issue_date,
      inv.due_date,
      inv.amount,
      inv.vat_amount,
      inv.total_amount,
      inv.status,
      inv.paid_date || "",
      inv.service_type || "",
      (inv.description || "").replace(/"/g, '""'),
    ]
      .map((v) => `"${v}"`)
      .join(",");
  });

  // BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const csv =
    bom + headers.map((h) => `"${h}"`).join(",") + "\n" + rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoices-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

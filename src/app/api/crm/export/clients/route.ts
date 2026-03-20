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

  const { data: clients } = await db
    .from("crm_clients")
    .select("*")
    .eq("is_archived", false)
    .order("company_name", { ascending: true });

  if (!clients || clients.length === 0) {
    return new Response("No data", { status: 404 });
  }

  // CSV header
  const headers = [
    "Компания",
    "ЕИК",
    "Лице за контакт",
    "Имейл",
    "Телефон",
    "Адрес",
    "Град",
    "Статус",
    "Таг",
  ];

  const rows = clients.map((c) => {
    const tags = Array.isArray(c.tags) ? (c.tags as string[]).join("; ") : "";
    return [
      c.company_name || "",
      c.eik || "",
      c.contact_person || "",
      c.email || "",
      c.phone || "",
      (c.address || "").replace(/"/g, '""'),
      c.city || "",
      c.status || "",
      tags,
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
      "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

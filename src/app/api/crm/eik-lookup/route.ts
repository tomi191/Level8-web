import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function GET(req: NextRequest) {
  const eik = req.nextUrl.searchParams.get("eik");
  if (!eik || eik.length < 9 || eik.length > 13) {
    return NextResponse.json(
      { error: "ЕИК трябва да е между 9 и 13 цифри" },
      { status: 400 }
    );
  }

  // Auth check
  const cookieStore = await cookies();
  const db = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lookup in CompanyBook.bg API (free, public commercial register data)
  try {
    const res = await fetch(
      `https://api.companybook.bg/api/companies/${encodeURIComponent(eik)}?with_data=true`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 }, // cache 24h
      }
    );

    if (res.status === 404) {
      return NextResponse.json(
        { error: "Фирмата не е намерена в Търговския регистър" },
        { status: 404 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Грешка при заявка към регистъра" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const company = data.company ?? data;

    // Extract structured address from seat
    const seat = company.seat;
    let address = "";
    let city = "";

    if (seat) {
      city = seat.settlement ?? "";
      const parts: string[] = [];
      if (seat.housingestate || seat.housingEstate)
        parts.push(`\u0436.\u043A. ${seat.housingestate || seat.housingEstate}`);
      if (seat.street) parts.push(`\u0443\u043B. ${seat.street}`);
      if (seat.streetNumber || seat.streetnumber)
        parts.push(`\u2116 ${seat.streetNumber || seat.streetnumber}`);
      if (seat.block) parts.push(`\u0431\u043B. ${seat.block}`);
      if (seat.entrance) parts.push(`\u0432\u0445. ${seat.entrance}`);
      if (seat.floor) parts.push(`\u0435\u0442. ${seat.floor}`);
      if (seat.apartment) parts.push(`\u0430\u043F. ${seat.apartment}`);
      address = parts.join(", ");
    }

    // Extract manager name
    const manager =
      company.managers?.[0]?.name ??
      company.soleCapitalOwner?.name ??
      null;

    return NextResponse.json({
      eik: company.uic,
      companyName:
        (company.companyName?.name ?? company.name ?? "").trim() +
        (company.legalForm ? ` ${mapLegalFormShort(company.legalForm)}` : ""),
      rawName: company.companyName?.name ?? company.name ?? "",
      legalForm: company.legalForm ?? null,
      address,
      city,
      manager: manager ? titleCase(manager) : null,
      status: company.status,
      activity: company.subjectOfActivity ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Неуспешна връзка с регистъра" },
      { status: 502 }
    );
  }
}

function mapLegalFormShort(legalForm: string): string {
  if (legalForm.includes("Еднолично дружество с ограничена отговорност"))
    return "ЕООД";
  if (legalForm.includes("дружество с ограничена отговорност")) return "ООД";
  if (legalForm.includes("акционерно дружество")) return "АД";
  if (legalForm.includes("Едноличен търговец")) return "ЕТ";
  if (legalForm.includes("кооперация")) return "Кооперация";
  return "";
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

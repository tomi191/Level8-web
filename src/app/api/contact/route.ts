import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { contactFormSchema } from "@/lib/validations";
import type { Database } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

let _supabase: SupabaseClient<Database> | null = null;
function getSupabase() {
  if (!_supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Невалидни данни." },
        { status: 400 }
      );
    }

    const { name, phone, website, message } = result.data;

    const { error } = await resend.emails.send({
      from: "LEVEL 8 <noreply@level8.bg>",
      to: "contact@level8.bg",
      subject: `Ново запитване от ${escapeHtml(name)}`,
      html: `
        <h2>Ново запитване от level8.bg</h2>
        <p><strong>Име:</strong> ${escapeHtml(name)}</p>
        <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
        ${website ? `<p><strong>Уебсайт:</strong> ${escapeHtml(website)}</p>` : ""}
        <p><strong>Съобщение:</strong></p>
        <p>${escapeHtml(message)}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, message: "Възникна грешка при изпращането." },
        { status: 500 }
      );
    }

    // Save to Supabase (non-blocking)
    try {
      await getSupabase()?.from("submissions").insert({
        type: "contact",
        name,
        phone,
        website: website || null,
        message,
      });
    } catch (e) {
      console.error("Supabase insert error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Благодарим! Ще се свържем с вас до 24 часа.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Възникна грешка. Моля, опитайте отново." },
      { status: 500 }
    );
  }
}

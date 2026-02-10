import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactFormSchema } from "@/lib/validations";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      from: "LEVEL 8 <onboarding@resend.dev>",
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

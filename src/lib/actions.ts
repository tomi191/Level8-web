"use server";

import { Resend } from "resend";
import { contactFormSchema, leadMagnetSchema, chatContactSchema } from "./validations";
import type { FormState } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "contact@level8.bg";
const FROM_EMAIL = "LEVEL 8 <onboarding@resend.dev>";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitContactForm(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
  };

  const result = contactFormSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Моля, коригирайте грешките във формата.",
      errors: fieldErrors,
    };
  }

  const { name, phone, website, message } = result.data;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
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
    return {
      success: false,
      message: "Възникна грешка при изпращането. Моля, опитайте отново.",
    };
  }

  return {
    success: true,
    message: "Благодарим! Ще се свържем с вас до 24 часа.",
  };
}

export async function submitLeadMagnet(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = { email: formData.get("email") };
  const result = leadMagnetSchema.safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Моля, въведете валиден имейл.",
      errors: fieldErrors,
    };
  }

  const { email } = result.data;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: "Нова заявка за безплатен одит",
    html: `
      <h2>Заявка за безплатен дигитален одит</h2>
      <p><strong>Имейл:</strong> ${escapeHtml(email)}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      message: "Възникна грешка. Моля, опитайте отново.",
    };
  }

  return {
    success: true,
    message: "Благодарим! Ще получите одита до 24 часа.",
  };
}

export async function submitChatContact(
  data: { name: string; phone: string; consent: boolean }
): Promise<FormState> {
  const result = chatContactSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Моля, попълнете всички полета коректно.",
      errors: fieldErrors,
    };
  }

  const { name, phone } = result.data;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: `Чатбот контакт: ${escapeHtml(name)}`,
    html: `
      <h2>Нов контакт от чатбота</h2>
      <p><strong>Име:</strong> ${escapeHtml(name)}</p>
      <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      message: "Възникна грешка. Моля, опитайте отново.",
    };
  }

  return {
    success: true,
    message: "Благодарим! Ще се свържем с вас скоро.",
  };
}

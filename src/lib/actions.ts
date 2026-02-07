"use server";

import { contactFormSchema, leadMagnetSchema, chatContactSchema } from "./validations";
import type { FormState } from "@/types";

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

  // In production, send to webhook / CRM / email
  console.log("Contact form submission:", result.data);

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

  console.log("Lead magnet submission:", result.data);

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

  console.log("Chat contact submission:", result.data);

  return {
    success: true,
    message: "Благодарим! Ще се свържем с вас скоро.",
  };
}

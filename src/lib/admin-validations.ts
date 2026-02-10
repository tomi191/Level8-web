import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Невалиден имейл"),
  password: z.string().min(6, "Паролата трябва да е поне 6 символа"),
});

export const generalSettingsSchema = z.object({
  site_name: z.string().min(1, "Задължително поле"),
  contact_email: z.email("Невалиден имейл"),
  phone: z.string().min(7, "Невалиден телефон"),
});

export const notificationSettingsSchema = z.object({
  email_on_contact: z.boolean(),
  email_on_lead: z.boolean(),
  email_on_chat: z.boolean(),
});

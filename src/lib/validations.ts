import { z } from "zod/v4";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Името трябва да е поне 2 символа"),
  phone: z.string().min(7, "Моля въведете валиден телефонен номер"),
  website: z.string().optional(),
  message: z.string().min(10, "Съобщението трябва да е поне 10 символа"),
  consent: z.literal(true, { error: "Трябва да приемете политиката за поверителност." }),
});

export const leadMagnetSchema = z.object({
  email: z.email("Моля въведете валиден имейл адрес"),
});

export const chatContactSchema = z.object({
  name: z.string().min(2, "Името трябва да е поне 2 символа"),
  phone: z.string().min(7, "Моля въведете валиден телефонен номер"),
  consent: z.literal(true, { error: "Трябва да приемете политиката за поверителност." }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type LeadMagnetValues = z.infer<typeof leadMagnetSchema>;
export type ChatContactValues = z.infer<typeof chatContactSchema>;

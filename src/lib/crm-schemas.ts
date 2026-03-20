import { z } from "zod/v4";

// --- Client Schema ---
export const clientSchema = z.object({
  company_name: z.string().min(1, "Името на фирмата е задължително"),
  eik: z
    .string()
    .regex(/^\d{9,13}$/, "ЕИК трябва да е 9-13 цифри")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  contact_person: z.string().optional().or(z.literal("")),
  email: z.email("Невалиден email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "paused", "lead"]).default("active"),
  contract_start_date: z.string().optional().or(z.literal("")),
  billing_email: z.email("Невалиден email за фактури").optional().or(z.literal("")),
  payment_method: z.enum(["bank_transfer", "card", "cash"]).optional(),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  is_internal: z.boolean().default(false),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// --- Website Schema ---
export const websiteSchema = z.object({
  client_id: z.uuid("Невалидно client ID"),
  domain: z.string().min(1, "Домейнът е задължителен"),
  url: z.string().url("Невалиден URL").optional().or(z.literal("")),
  name: z.string().optional().or(z.literal("")),
  platform: z.enum(["wordpress", "nextjs", "shopify", "custom"]).optional(),
  platform_version: z.string().optional().or(z.literal("")),
  hosting_provider: z.string().optional().or(z.literal("")),
  hosting_plan: z.string().optional().or(z.literal("")),
  hosting_renewal_date: z.string().optional().or(z.literal("")),
  cloudflare_zone_id: z.string().optional().or(z.literal("")),
  ssl_status: z.enum(["active", "expired", "none"]).default("active"),
  ssl_expiry_date: z.string().optional().or(z.literal("")),
  ssl_provider: z.string().optional().or(z.literal("")),
  domain_registrar: z.string().optional().or(z.literal("")),
  domain_expiry_date: z.string().optional().or(z.literal("")),
  domain_auto_renew: z.boolean().default(true),
  cms_admin_url: z.string().url("Невалиден URL").optional().or(z.literal("")),
  cms_credentials_note: z.string().optional().or(z.literal("")),
  ga4_property_id: z.string().optional().or(z.literal("")),
  gsc_property_url: z.string().optional().or(z.literal("")),
  facebook_pixel_id: z.string().optional().or(z.literal("")),
  contact_email: z.email("Невалиден email").optional().or(z.literal("")),
  status: z.enum(["active", "maintenance", "development", "archived"]).default("active"),
  notes: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

export type WebsiteFormData = z.infer<typeof websiteSchema>;

// --- Invoice Line Item Schema ---
const lineItemSchema = z.object({
  description: z.string().min(1, "Описанието е задължително"),
  qty: z.number().positive("Количеството трябва да е положително"),
  unit_price: z.number().min(0, "Цената не може да е отрицателна"),
  total: z.number().min(0),
});

// --- Invoice Schema ---
export const invoiceSchema = z.object({
  client_id: z.uuid("Невалидно client ID"),
  website_id: z.uuid("Невалидно website ID").optional().or(z.literal("")),
  amount: z.number().min(0, "Сумата не може да е отрицателна"),
  vat_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0, "Общата сума не може да е отрицателна"),
  currency: z.string().default("EUR"),
  service_type: z
    .enum(["hosting", "maintenance", "development", "seo", "design", "other"])
    .optional(),
  description: z.string().optional().or(z.literal("")),
  is_recurring: z.boolean().default(false),
  recurring_interval: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  period_start: z.string().optional().or(z.literal("")),
  period_end: z.string().optional().or(z.literal("")),
  due_date: z.string().min(1, "Падежната дата е задължителна"),
  items: z.array(lineItemSchema).default([]),
  notes: z.string().optional().or(z.literal("")),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// --- Service Schema ---
export const clientServiceSchema = z.object({
  client_id: z.uuid("Невалидно client ID"),
  website_id: z.uuid("Невалидно website ID").optional().or(z.literal("")),
  name: z.string().min(1, "Името на услугата е задължително"),
  service_type: z
    .enum(["hosting", "maintenance", "development", "seo", "design", "other"])
    .default("other"),
  price: z.number().min(0, "Цената не може да е отрицателна"),
  currency: z.string().default("EUR"),
  billing_cycle: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  start_date: z.string().min(1, "Началната дата е задължителна"),
  end_date: z.string().optional().or(z.literal("")),
  next_billing_date: z.string().optional().or(z.literal("")),
  auto_renew: z.boolean().default(true),
  status: z.enum(["active", "paused", "cancelled"]).default("active"),
  notes: z.string().optional().or(z.literal("")),
});

export type ServiceFormData = z.infer<typeof clientServiceSchema>;

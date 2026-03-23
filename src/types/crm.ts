// ============================================================
// CRM Module Types
// ============================================================

// --- Notification Types ---
export type NotificationType =
  | "billing_upcoming"
  | "billing_generated"
  | "billing_sent"
  | "billing_paid"
  | "billing_overdue"
  | "domain_expiry"
  | "ssl_expiry"
  | "system"
  | "hub_event";

export type NotificationSeverity = "info" | "warning" | "urgent";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  telegram_sent: boolean;
  email_sent: boolean;
  created_at: string;
}

// --- Billing Pipeline ---
export interface BillingPipelineItem {
  id: string;
  clientName: string;
  serviceName: string;
  domain: string | null;
  amount: number;
  currency: string;
  billingCycle: string;
  dueDate: string;
  daysUntil: number;
  invoiceId: string | null;
  invoiceNumber: string | null;
  invoiceStatus: InvoiceStatus | null;
  pdfUrl: string | null;
  serviceId: string;
  clientId: string;
}

export interface BillingPipelineData {
  upcoming: BillingPipelineItem[];     // services с next_billing_date <= 30 дни, без invoice
  drafts: BillingPipelineItem[];       // draft invoices без PDF
  readyToSend: BillingPipelineItem[];  // invoices с PDF, не изпратени
  sent: BillingPipelineItem[];         // sent invoices, чакащи плащане
  paidThisMonth: number;               // бройка платени този месец
  paidThisMonthTotal: number;          // сума платени този месец
}

// --- Contract Types ---
export type ContractType = "maintenance" | "development" | "audit" | "other";
export type ContractStatus = "draft" | "sent" | "signed" | "active" | "expired" | "terminated";
export type ContractVariant = "a" | "b";

export interface CrmContract {
  id: string;
  client_id: string;
  website_id: string | null;
  parent_id: string | null;
  contract_number: string | null;
  type: ContractType;
  title: string;
  description: string | null;
  status: ContractStatus;
  variant: ContractVariant | null;
  monthly_price: number | null;
  hourly_rate: number;
  included_hours: number;
  total_amount: number | null;
  currency: string;
  payment_due_day: number;
  minimum_period_months: number;
  auto_renew: boolean;
  created_date: string | null;
  sent_date: string | null;
  signed_date: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  terminated_date: string | null;
  platform_name: string | null;
  platform_url: string | null;
  tech_stack: string[];
  pdf_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmContractWithClient extends CrmContract {
  crm_clients: Pick<CrmClient, "id" | "company_name" | "eik" | "address" | "city" | "contact_person" | "email">;
}

export interface CrmContractWithAnnexes extends CrmContractWithClient {
  annexes: CrmContract[];
}

export interface ExpiringContract {
  id: string;
  client_id: string;
  company_name: string;
  contract_number: string | null;
  title: string;
  type: ContractType;
  status: ContractStatus;
  expiry_date: string;
  urgency: "expired" | "critical" | "warning" | "ok";
}

// --- Status Unions ---
export type ClientStatus = "active" | "inactive" | "paused" | "lead";
export type WebsiteStatus = "active" | "maintenance" | "development" | "archived";
export type WebsitePlatform = "wordpress" | "nextjs" | "shopify" | "custom";
export type HostingProvider = "superhosting" | "vercel" | "netlify" | "other";
export type InvoiceStatus = "draft" | "pending" | "sent" | "paid" | "overdue" | "cancelled";
export type ServiceType = "hosting" | "maintenance" | "development" | "seo" | "design" | "other";
export type PaymentMethod = "bank_transfer" | "card" | "cash";
export type RecurringInterval = "monthly" | "quarterly" | "yearly";
export type SslStatus = "active" | "expired" | "none";
export type ReminderType = "domain_expiry" | "ssl_expiry" | "invoice_overdue" | "hosting_renewal" | "custom";
export type ReminderStatus = "pending" | "sent" | "dismissed" | "snoozed";
export type EntityType = "client" | "website" | "invoice" | "domain" | "service" | "contract";
export type ActivityAction = "created" | "updated" | "archived" | "deleted" | "payment_received" | "note_added" | "status_changed";
export type DomainUrgency = "expired" | "critical" | "warning" | "ok";
export type ServiceStatus = "active" | "paused" | "cancelled";
export type BillingCycle = "monthly" | "quarterly" | "yearly";

// --- Invoice Line Item ---
export interface InvoiceLineItem {
  description: string;
  qty: number;
  unit_price: number;
  total: number;
}

// --- Core Entities ---
export interface CrmClient {
  id: string;
  company_name: string;
  eik: string | null;
  address: string | null;
  city: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  contract_start_date: string | null;
  billing_email: string | null;
  payment_method: string | null;
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  is_internal: boolean;
  is_archived: boolean;
  contacts: CrmClientContact[];
  portal_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmClientContact {
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
}

export interface CrmWebsite {
  id: string;
  client_id: string;
  domain: string;
  url: string | null;
  name: string | null;
  platform: string | null;
  platform_version: string | null;
  hosting_provider: string | null;
  hosting_plan: string | null;
  hosting_renewal_date: string | null;
  cloudflare_zone_id: string | null;
  ssl_status: string | null;
  ssl_expiry_date: string | null;
  ssl_provider: string | null;
  domain_registrar: string | null;
  domain_expiry_date: string | null;
  domain_auto_renew: boolean;
  cms_admin_url: string | null;
  cms_credentials_note: string | null;
  ga4_property_id: string | null;
  gsc_property_url: string | null;
  facebook_pixel_id: string | null;
  contact_email: string | null;
  status: WebsiteStatus;
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Hub fields
  supabase_project_url: string | null;
  supabase_key_encrypted: string | null;
  hub_tables_config: HubTablesConfig;
  hub_connected: boolean;
  hub_last_sync: string | null;
  hub_webhook_token: string | null;
  hub_flow_config: HubFlowConfig;
}

export interface CrmInvoice {
  id: string;
  client_id: string;
  website_id: string | null;
  service_id: string | null;
  invoice_number: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  service_type: string | null;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: string | null;
  period_start: string | null;
  period_end: string | null;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  items: InvoiceLineItem[];
  notes: string | null;
  reminder_count: number;
  last_reminder_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  pdf_url: string | null;
  metadata: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmCronLog {
  id: string;
  run_type: string;
  invoices_generated: number;
  invoices_marked_overdue: number;
  notifications_sent: number;
  errors: string[] | null;
  duration_ms: number | null;
  created_at: string;
}

export interface CrmReminder {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  reminder_type: ReminderType;
  title: string;
  description: string | null;
  due_date: string | null;
  remind_at: string | null;
  status: ReminderStatus;
  is_auto: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmActivityLog {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActivityAction;
  actor: string | null;
  description: string | null;
  changes: Record<string, { old: unknown; new: unknown }> | null;
  created_at: string;
}

export interface CrmCloudflareCache {
  id: string;
  website_id: string;
  zone_id: string | null;
  data_type: string;
  data: Record<string, unknown>;
  fetched_at: string;
  expires_at: string;
}

export interface CrmClientService {
  id: string;
  client_id: string;
  website_id: string | null;
  name: string;
  service_type: string;
  price: number;
  currency: string;
  billing_cycle: string;
  start_date: string;
  end_date: string | null;
  next_billing_date: string | null;
  auto_renew: boolean;
  status: ServiceStatus;
  notes: string | null;
  metadata: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmClientServiceWithRelations extends CrmClientService {
  crm_clients: Pick<CrmClient, "id" | "company_name">;
  crm_websites?: Pick<CrmWebsite, "id" | "domain"> | null;
}

export interface PlatformDetectionResult {
  platform: string | null;
  platform_version: string | null;
  signals: string[];
  error?: string;
}

// --- Joined Types ---
export interface CrmWebsiteWithClient extends CrmWebsite {
  crm_clients: Pick<CrmClient, "id" | "company_name" | "email" | "phone">;
}

export interface CrmInvoiceWithClient extends CrmInvoice {
  crm_clients: Pick<CrmClient, "id" | "company_name" | "email">;
}

// --- Dashboard Types ---
export interface CrmDashboardStats {
  totalClients: number;
  activeWebsites: number;
  revenueThisMonth: number;
  expiringDomains: number;
  overdueInvoices: number;
  pendingInvoices: number;
  mrr: number;
  activeServices: number;
}

export interface ExpiringDomain {
  id: string;
  domain: string;
  client_id: string;
  company_name: string;
  domain_expiry_date: string | null;
  domain_registrar: string | null;
  domain_auto_renew: boolean;
  ssl_expiry_date: string | null;
  ssl_provider: string | null;
  ssl_status: string | null;
  earliest_expiry: string | null;
  urgency: DomainUrgency;
}

// --- Input Types (for forms) ---
export interface CrmClientInput {
  company_name: string;
  eik?: string;
  address?: string;
  city?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  status?: ClientStatus;
  contract_start_date?: string;
  billing_email?: string;
  payment_method?: string;
  notes?: string;
  tags?: string[];
  is_internal?: boolean;
}

export interface CrmWebsiteInput {
  client_id: string;
  domain: string;
  url?: string;
  name?: string;
  platform?: string;
  platform_version?: string;
  hosting_provider?: string;
  hosting_plan?: string;
  hosting_renewal_date?: string;
  cloudflare_zone_id?: string;
  ssl_status?: string;
  ssl_expiry_date?: string;
  ssl_provider?: string;
  domain_registrar?: string;
  domain_expiry_date?: string;
  domain_auto_renew?: boolean;
  cms_admin_url?: string;
  cms_credentials_note?: string;
  ga4_property_id?: string;
  gsc_property_url?: string;
  facebook_pixel_id?: string;
  contact_email?: string;
  status?: WebsiteStatus;
  notes?: string;
  tags?: string[];
}

export interface CrmInvoiceInput {
  client_id: string;
  website_id?: string;
  amount: number;
  vat_amount?: number;
  total_amount: number;
  currency?: string;
  service_type?: string;
  description?: string;
  is_recurring?: boolean;
  recurring_interval?: string;
  period_start?: string;
  period_end?: string;
  due_date: string;
  items?: InvoiceLineItem[];
  notes?: string;
}

// ============================================================
// Hub Types
// ============================================================

export interface HubTableConfig {
  label: string;
  icon: string;
  notify: boolean;
  notify_fields: string[];
  count_field: string;
  message_template: string;
}

export type HubTablesConfig = Record<string, HubTableConfig>;

export interface HubEvent {
  id: string;
  website_id: string;
  event_type: string;
  table_name: string;
  record_data: Record<string, unknown> | null;
  notified: boolean;
  created_at: string;
  flow_instance_id: string | null;
}

export interface HubSchemaTable {
  name: string;
  columns: HubSchemaColumn[];
  row_count: number;
}

export interface HubSchemaColumn {
  name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}

export interface HubConnectionStatus {
  connected: boolean;
  project_url: string | null;
  last_sync: string | null;
  webhook_token: string | null;
  tables_config: HubTablesConfig;
  flow_config: HubFlowConfig;
}

export interface HubOverviewProject {
  website_id: string;
  domain: string;
  client_name: string;
  connected: boolean;
  last_sync: string | null;
  tables_configured: number;
  recent_events: number;
}

// ============================================================
// Hub Flow Types
// ============================================================

export interface HubFlowDefinition {
  label: string;
  icon: string;
  trigger_table: string;
  expected_tables: string[];
  optional_tables: string[];
  timeout_seconds: number;
  correlation_fields: Record<string, string>;
}

export type HubFlowConfig = Record<string, HubFlowDefinition>;

export interface HubFlowInstance {
  id: string;
  website_id: string;
  flow_name: string;
  correlation_value: string;
  status: "pending" | "completed" | "partial";
  steps: Record<string, "completed" | "pending" | "missing">;
  timeout_at: string;
  notified: boolean;
  created_at: string;
  completed_at: string | null;
}

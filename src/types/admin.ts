export type SubmissionType = "contact" | "lead" | "chat";

export interface Submission {
  id: string;
  type: SubmissionType;
  name: string | null;
  phone: string | null;
  website: string | null;
  message: string | null;
  email: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  read_at: string | null;
  notes: string | null;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface GeneralSettings {
  site_name: string;
  contact_email: string;
  phone: string;
}

export interface NotificationSettings {
  email_on_contact: boolean;
  email_on_lead: boolean;
  email_on_chat: boolean;
}

export interface DashboardStats {
  total: number;
  unread: number;
  thisWeek: number;
  thisMonth: number;
}

export type ContentType = "tofu" | "mofu" | "bofu" | "advertorial";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean | null;
  featured: boolean | null;
  content_type: string | null;
  category: string;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  read_time: number;
  word_count: number | null;
  image: string;
  author: Record<string, unknown>;
  ai_generated: boolean | null;
  ai_model: string | null;
  tldr: string | null;
  key_takeaways: unknown[] | null;
  faq: unknown[] | null;
  sources: unknown[] | null;
  published_at: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AIUsageLog {
  id: string;
  feature: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

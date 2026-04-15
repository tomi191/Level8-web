export type SubmissionType = "contact" | "lead" | "chat";

export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  timestamp?: string;
}

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
  // Lead attribution metadata
  session_id: string | null;
  source_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  user_agent: string | null;
  chat_history: ChatMessage[] | null;
}

export interface PageView {
  path: string;
  title?: string;
  timestamp: string;
  duration_seconds?: number;
}

export interface VisitorSession {
  id: string;
  session_id: string;
  first_visit_at: string;
  last_activity_at: string;
  initial_page: string | null;
  initial_referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  user_agent: string | null;
  country: string | null;
  page_views: PageView[];
  page_view_count: number;
  total_duration_seconds: number;
  has_submission: boolean;
  created_at: string;
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
  audio_url: string | null;
  audio_duration_sec: number | null;
  video_url: string | null;
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

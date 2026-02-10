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
  content: string | null;
  excerpt: string | null;
  status: string;
  content_type: string | null;
  category: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  reading_time: number | null;
  word_count: number | null;
  featured_image: string | null;
  audio_url: string | null;
  audio_duration_sec: number | null;
  video_url: string | null;
  video_task_id: string | null;
  social_posts: Record<string, unknown> | null;
  ai_model: string | null;
  generation_cost_usd: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
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

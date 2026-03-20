// ============================================================
// Cloudflare API Types
// ============================================================

export interface CFApiResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
}

export interface CFZone {
  id: string;
  name: string;
  status: "active" | "pending" | "initializing" | "moved" | "deleted" | "deactivated";
  paused: boolean;
  type: string;
  name_servers: string[];
  original_name_servers: string[];
  created_on: string;
  modified_on: string;
}

export interface CFDnsRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  priority?: number;
  created_on: string;
  modified_on: string;
}

export interface CFSslCertificatePack {
  id: string;
  type: string;
  hosts: string[];
  status: "active" | "pending_validation" | "pending_issuance" | "pending_deployment" | "expired";
  certificate_authority: string;
  validity_days: number;
}

export interface CFAnalyticsResult {
  pageviews: number;
  unique_visitors: number;
  bandwidth_bytes: number;
  threats: number;
  requests: number;
  cached_requests: number;
}

// --- Health Check Types ---
export type HealthStatus = "healthy" | "warning" | "critical" | "unknown";

export interface HealthCheckItem {
  label: string;
  status: HealthStatus;
  detail: string;
  expiryDate?: string;
}

export interface WebsiteHealthCheck {
  overall: HealthStatus;
  items: HealthCheckItem[];
  lastSync: string | null;
}

// ============================================================
// Cloudflare API Client (read-only)
// ============================================================

import type {
  CFApiResponse,
  CFZone,
  CFDnsRecord,
  CFSslCertificatePack,
  CFAnalyticsResult,
} from "@/types/cloudflare";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

function getToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN is not set");
  return token;
}

async function cfFetch<T>(path: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${CF_API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { data: null, error: `CF API ${res.status}: ${res.statusText}` };
    }

    const json = (await res.json()) as CFApiResponse<T>;
    if (!json.success) {
      return { data: null, error: json.errors?.[0]?.message ?? "CF API error" };
    }

    return { data: json.result, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// --- REST Endpoints ---

export async function listZones() {
  return cfFetch<CFZone[]>("/zones?per_page=50&status=active");
}

export async function getZone(zoneId: string) {
  return cfFetch<CFZone>(`/zones/${zoneId}`);
}

export async function getDnsRecords(zoneId: string) {
  return cfFetch<CFDnsRecord[]>(`/zones/${zoneId}/dns_records?per_page=100`);
}

export async function getSslCertificates(zoneId: string) {
  return cfFetch<CFSslCertificatePack[]>(`/zones/${zoneId}/ssl/certificate_packs?per_page=50`);
}

// --- GraphQL Analytics ---

export async function getZoneAnalytics(
  zoneId: string,
  days: 7 | 30 = 7
): Promise<{ data: CFAnalyticsResult | null; error: string | null }> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const query = `
    query {
      viewer {
        zones(filter: { zoneTag: "${zoneId}" }) {
          httpRequests1dGroups(
            limit: 1
            filter: { date_geq: "${since.toISOString().split("T")[0]}", date_lt: "${new Date().toISOString().split("T")[0]}" }
          ) {
            sum {
              pageViews
              requests
              cachedRequests
              bytes
              threats
            }
            uniq {
              uniques
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      return { data: null, error: `CF GraphQL ${res.status}` };
    }

    const json = await res.json();
    const groups = json?.data?.viewer?.zones?.[0]?.httpRequests1dGroups?.[0];
    if (!groups) {
      return { data: null, error: "No analytics data" };
    }

    return {
      data: {
        pageviews: groups.sum?.pageViews ?? 0,
        unique_visitors: groups.uniq?.uniques ?? 0,
        bandwidth_bytes: groups.sum?.bytes ?? 0,
        threats: groups.sum?.threats ?? 0,
        requests: groups.sum?.requests ?? 0,
        cached_requests: groups.sum?.cachedRequests ?? 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

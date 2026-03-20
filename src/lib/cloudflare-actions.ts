"use server";

import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { listZones, getZone, getDnsRecords, getSslCertificates, getZoneAnalytics } from "@/lib/cloudflare";

// TTL in hours
const TTL = {
  zone: 6,
  dns: 6,
  ssl: 12,
  analytics_7d: 2,
  analytics_30d: 2,
};

function expiresAt(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- CRM tables not yet in database.ts
type UntypedSupabase = any;

async function upsertCache(
  supabase: UntypedSupabase,
  websiteId: string,
  zoneId: string,
  dataType: string,
  data: unknown,
  ttlHours: number
) {
  await supabase.from("crm_cloudflare_cache").upsert(
    {
      website_id: websiteId,
      zone_id: zoneId,
      data_type: dataType,
      data: data,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt(ttlHours),
    },
    { onConflict: "website_id,data_type" }
  );
}

// ============================================================
// Sync single website
// ============================================================

export async function syncWebsite(websiteId: string) {
  const { supabase } = await requireAdmin();
  const db = supabase as UntypedSupabase;

  // Get website
  const { data: website } = await db
    .from("crm_websites")
    .select("id, domain, cloudflare_zone_id")
    .eq("id", websiteId)
    .single();

  if (!website) return { error: "Website not found" };

  let zoneId = website.cloudflare_zone_id as string | null;

  // If no zone_id stored, try to find by domain
  if (!zoneId) {
    const { data: zones } = await listZones();
    const match = zones?.find((z) => z.name === website.domain);
    if (match) {
      zoneId = match.id;
      await db
        .from("crm_websites")
        .update({ cloudflare_zone_id: match.id })
        .eq("id", websiteId);
    } else {
      return { error: `No CF zone found for ${website.domain}` };
    }
  }

  // Fetch zone details
  const { data: zone } = await getZone(zoneId);
  if (zone) {
    await upsertCache(db, websiteId, zoneId, "zone_details", zone, TTL.zone);
  }

  // Fetch DNS records
  const { data: dns } = await getDnsRecords(zoneId);
  if (dns) {
    await upsertCache(db, websiteId, zoneId, "dns_records", dns, TTL.dns);
  }

  // Fetch SSL
  const { data: ssl } = await getSslCertificates(zoneId);
  if (ssl) {
    await upsertCache(db, websiteId, zoneId, "ssl_status", ssl, TTL.ssl);
  }

  // Fetch analytics 7d
  const { data: analytics7 } = await getZoneAnalytics(zoneId, 7);
  if (analytics7) {
    await upsertCache(db, websiteId, zoneId, "analytics_7d", analytics7, TTL.analytics_7d);
  }

  // Fetch analytics 30d
  const { data: analytics30 } = await getZoneAnalytics(zoneId, 30);
  if (analytics30) {
    await upsertCache(db, websiteId, zoneId, "analytics_30d", analytics30, TTL.analytics_30d);
  }

  revalidatePath(`/admin/crm/websites/${websiteId}`);
  return { success: true };
}

// ============================================================
// Sync all websites (sequential with delay)
// ============================================================

export async function syncAllWebsites() {
  const { supabase } = await requireAdmin();
  const db = supabase as UntypedSupabase;

  const { data: websites } = await db
    .from("crm_websites")
    .select("id")
    .eq("is_archived", false)
    .not("cloudflare_zone_id", "is", null);

  if (!websites?.length) return { synced: 0 };

  let synced = 0;
  for (const site of websites as { id: string }[]) {
    await syncWebsite(site.id);
    synced++;
    // 250ms delay between requests for rate limit safety
    if (synced < websites.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  revalidatePath("/admin/crm");
  return { synced };
}

// ============================================================
// Auto-match zones to websites
// ============================================================

export async function syncAllZones() {
  const { supabase } = await requireAdmin();
  const db = supabase as UntypedSupabase;

  const { data: zones } = await listZones();
  if (!zones) return { matched: 0 };

  const { data: websites } = await db
    .from("crm_websites")
    .select("id, domain, cloudflare_zone_id")
    .eq("is_archived", false);

  if (!websites) return { matched: 0 };

  let matched = 0;
  for (const site of websites as { id: string; domain: string; cloudflare_zone_id: string | null }[]) {
    if (site.cloudflare_zone_id) continue;
    const zone = zones.find((z) => z.name === site.domain);
    if (zone) {
      await db
        .from("crm_websites")
        .update({ cloudflare_zone_id: zone.id })
        .eq("id", site.id);
      matched++;
    }
  }

  revalidatePath("/admin/crm/websites");
  return { matched };
}

/**
 * Domain info lookup — RDAP with WHOIS API fallback.
 *
 * RDAP coverage: .com, .net, .org (via rdap.org proxy)
 * WHOIS fallback: .eu, .bg, and all other TLDs (via whoisjson.com free tier)
 */

export interface DomainInfo {
  expiryDate: string | null;
  registrar: string | null;
  status: string[];
  registrationDate: string | null;
  source: "rdap" | "whois";
}

// TLDs known to have RDAP in IANA bootstrap
const RDAP_SUPPORTED_TLDS = new Set([
  "com", "net", "org", "info", "biz", "name", "mobi", "pro",
  "aero", "asia", "cat", "coop", "jobs", "museum", "tel", "travel",
  "xxx", "app", "dev", "page", "how", "soy", "chrome", "google",
  "io", "co", "me", "tv", "cc",
]);

/**
 * Fetch domain info — tries RDAP first, falls back to WHOIS API.
 */
export async function fetchDomainInfo(
  domain: string
): Promise<DomainInfo | null> {
  const tld = domain.split(".").pop()?.toLowerCase() || "";

  // Try ip2whois API first (works for .com, .net, .org, etc.)
  const ip2w = await fetchIp2Whois(domain);
  if (ip2w) return ip2w;

  // Try RDAP for supported TLDs
  if (RDAP_SUPPORTED_TLDS.has(tld)) {
    const rdap = await fetchRdap(domain);
    if (rdap) return rdap;
  }

  // Fallback: WHOIS raw text parsing (gets registrar for .eu/.bg)
  const whois = await fetchWhois(domain);
  if (whois) return whois;

  // Last resort: try RDAP anyway
  if (!RDAP_SUPPORTED_TLDS.has(tld)) {
    const rdap = await fetchRdap(domain);
    if (rdap) return rdap;
  }

  return null;
}

/**
 * ip2whois.com API — free 500 queries/month.
 * Works for .com, .net, .org. Does NOT support .eu, .bg.
 * Env var: IP2WHOIS_API_KEY
 */
async function fetchIp2Whois(domain: string): Promise<DomainInfo | null> {
  const apiKey = process.env.IP2WHOIS_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.ip2whois.com/v2?key=${apiKey}&domain=${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    const expiryDate = data.expire_date ? parseDate(data.expire_date) : null;
    const registrar = typeof data.registrar === "object"
      ? data.registrar?.name || null
      : data.registrar || null;
    const registrationDate = data.create_date ? parseDate(data.create_date) : null;

    if (!expiryDate && !registrar) return null;

    return {
      expiryDate,
      registrar,
      status: data.status ? [data.status] : [],
      registrationDate,
      source: "whois",
    };
  } catch {
    return null;
  }
}

/**
 * RDAP lookup via rdap.org universal proxy.
 */
async function fetchRdap(domain: string): Promise<DomainInfo | null> {
  try {
    const res = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      {
        headers: { Accept: "application/rdap+json" },
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    let expiryDate: string | null = null;
    let registrationDate: string | null = null;

    const events = data.events as { eventAction: string; eventDate: string }[] | undefined;
    if (events) {
      for (const event of events) {
        if (event.eventAction === "expiration") {
          expiryDate = event.eventDate?.split("T")[0] || null;
        }
        if (event.eventAction === "registration") {
          registrationDate = event.eventDate?.split("T")[0] || null;
        }
      }
    }

    let registrar: string | null = null;
    const entities = data.entities as { roles?: string[]; vcardArray?: unknown[]; handle?: string }[] | undefined;
    if (entities) {
      for (const entity of entities) {
        if (entity.roles?.includes("registrar")) {
          if (entity.vcardArray && Array.isArray(entity.vcardArray[1])) {
            const fnEntry = (entity.vcardArray[1] as unknown[][]).find(
              (e) => e[0] === "fn"
            );
            if (fnEntry) registrar = String(fnEntry[3]);
          }
          if (!registrar && entity.handle) registrar = entity.handle;
        }
      }
    }

    const status = (data.status as string[]) || [];

    return { expiryDate, registrar, status, registrationDate, source: "rdap" };
  } catch {
    return null;
  }
}

/**
 * WHOIS lookup via free WHOIS JSON APIs.
 * Tries multiple providers for reliability.
 */
async function fetchWhois(domain: string): Promise<DomainInfo | null> {
  // Provider 1: whois.freeaiapi.xyz (free, no key)
  try {
    const res = await fetch(
      `https://whois.freeaiapi.xyz/?name=${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.expiry_date || data.expiration_date) {
        return {
          expiryDate: parseDate(data.expiry_date || data.expiration_date),
          registrar: data.registrar || null,
          status: Array.isArray(data.status) ? data.status : data.status ? [data.status] : [],
          registrationDate: parseDate(data.creation_date || data.created),
          source: "whois",
        };
      }
    }
  } catch { /* try next */ }

  // Provider 2: Raw WHOIS text parsing via whoisjs.com
  // Note: .eu and .bg hide expiry dates due to GDPR, but registrar is available
  try {
    const res = await fetch(
      `https://whoisjs.com/api/v1/${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const data = await res.json();
      const raw = data.raw || "";
      const expiryDate = extractFromWhoisText(raw, [
        "Registry Expiry Date:",
        "Expiry Date:",
        "Expiration Date:",
        "paid-till:",
        "expires:",
        "renewal date:",
      ]);
      const registrar = extractFromWhoisText(raw, [
        "Registrar:",
        "registrar:",
        "Sponsoring Registrar:",
      ]) || extractRegistrarFromWhoisBlock(raw);

      const registrationDate = extractFromWhoisText(raw, [
        "Creation Date:",
        "Created:",
        "created:",
        "Registration Date:",
      ]);

      // Return if we got ANY useful data (registrar OR expiry)
      if (expiryDate || registrar) {
        return {
          expiryDate: parseDate(expiryDate),
          registrar,
          status: [],
          registrationDate: parseDate(registrationDate),
          source: "whois",
        };
      }
    }
  } catch { /* no more providers */ }

  return null;
}

/**
 * Extract registrar from EURid-style WHOIS block format:
 *   Registrar:
 *       Name: SuperHosting.BG Ltd.
 */
function extractRegistrarFromWhoisBlock(text: string): string | null {
  const match = text.match(/Registrar:\s*\n\s*Name:\s*(.+)/im);
  if (match) return match[1].trim();

  // Try Technical Organisation (EURid shows this)
  const techMatch = text.match(/Technical:\s*\n\s*Organisation:\s*(.+)/im);
  if (techMatch) return techMatch[1].trim();

  return null;
}

/**
 * Extract a value from raw WHOIS text by trying multiple field names.
 */
function extractFromWhoisText(text: string, fieldNames: string[]): string | null {
  for (const field of fieldNames) {
    const regex = new RegExp(`${field}\\s*(.+)`, "im");
    const match = text.match(regex);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Parse various date formats into YYYY-MM-DD.
 */
function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

// Keep backward-compatible export name
export const fetchDomainRdap = fetchDomainInfo;

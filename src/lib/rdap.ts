/**
 * RDAP (Registration Data Access Protocol) — fetch real domain info.
 * Uses rdap.org as universal proxy (routes to correct TLD server).
 */

export interface RdapDomainInfo {
  expiryDate: string | null;
  registrar: string | null;
  status: string[];
  registrationDate: string | null;
}

export async function fetchDomainRdap(
  domain: string
): Promise<RdapDomainInfo | null> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Extract expiry date from events
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

    // Extract registrar from entities
    let registrar: string | null = null;
    const entities = data.entities as { roles?: string[]; vcardArray?: unknown[]; handle?: string }[] | undefined;
    if (entities) {
      for (const entity of entities) {
        if (entity.roles?.includes("registrar")) {
          // Try to get name from vcardArray or handle
          if (entity.vcardArray && Array.isArray(entity.vcardArray[1])) {
            const fnEntry = (entity.vcardArray[1] as unknown[][]).find(
              (e) => e[0] === "fn"
            );
            if (fnEntry) {
              registrar = String(fnEntry[3]);
            }
          }
          if (!registrar && entity.handle) {
            registrar = entity.handle;
          }
        }
      }
    }

    // Extract status
    const status = (data.status as string[]) || [];

    return { expiryDate, registrar, status, registrationDate };
  } catch {
    return null;
  }
}

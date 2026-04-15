/**
 * Client-side session tracking for lead attribution.
 *
 * - Generates a persistent session_id (30-day localStorage TTL)
 * - Captures UTM parameters + referrer on first visit
 * - Tracks page views via /api/track
 * - Exposes getSessionContext() for forms to attach on submission
 *
 * GDPR: localStorage used (not cookies) for first-party functional storage.
 * No PII is stored client-side. IP address is captured server-side only.
 */

const SESSION_ID_KEY = "l8_sid";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const UTM_KEY = "l8_utm";
const INITIAL_PAGE_KEY = "l8_initial_page";
const INITIAL_REFERRER_KEY = "l8_initial_referrer";

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

export interface SessionContext {
  session_id: string;
  source_page: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  user_agent: string | null;
}

function isServer(): boolean {
  return typeof window === "undefined";
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Get or create a session ID with a 30-day TTL.
 */
export function getSessionId(): string {
  if (isServer()) return "";

  try {
    const raw = localStorage.getItem(SESSION_ID_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; expires: number };
      if (parsed.expires > Date.now()) {
        return parsed.id;
      }
    }
  } catch {
    // Corrupted storage — reset
  }

  const newId = generateSessionId();
  try {
    localStorage.setItem(
      SESSION_ID_KEY,
      JSON.stringify({ id: newId, expires: Date.now() + SESSION_TTL_MS })
    );
  } catch {
    // Storage quota or disabled
  }
  return newId;
}

/**
 * Extract UTM params from the current URL.
 */
function readUrlUtm(): UtmParams {
  if (isServer()) {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  };
}

/**
 * Get stored UTM params (from first visit with UTMs).
 * If current URL has UTMs, they override the stored ones.
 */
export function getUtmParams(): UtmParams {
  if (isServer()) {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }

  const urlUtm = readUrlUtm();
  const hasUrlUtm = Object.values(urlUtm).some((v) => v !== null);

  if (hasUrlUtm) {
    try {
      sessionStorage.setItem(UTM_KEY, JSON.stringify(urlUtm));
    } catch {}
    return urlUtm;
  }

  try {
    const stored = sessionStorage.getItem(UTM_KEY);
    if (stored) return JSON.parse(stored) as UtmParams;
  } catch {}

  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  };
}

function getInitialPage(): string | null {
  if (isServer()) return null;
  try {
    const stored = sessionStorage.getItem(INITIAL_PAGE_KEY);
    if (stored) return stored;
    const current = window.location.pathname + window.location.search;
    sessionStorage.setItem(INITIAL_PAGE_KEY, current);
    return current;
  } catch {
    return window.location.pathname;
  }
}

function getInitialReferrer(): string | null {
  if (isServer()) return null;
  try {
    const stored = sessionStorage.getItem(INITIAL_REFERRER_KEY);
    if (stored) return stored;
    const ref = document.referrer || null;
    sessionStorage.setItem(INITIAL_REFERRER_KEY, ref || "");
    return ref;
  } catch {
    return document.referrer || null;
  }
}

/**
 * Build the full session context for a form submission.
 */
export function getSessionContext(): SessionContext {
  if (isServer()) {
    return {
      session_id: "",
      source_page: "",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
      referrer: null,
      user_agent: null,
    };
  }

  const utm = getUtmParams();
  return {
    session_id: getSessionId(),
    source_page: window.location.pathname + window.location.search,
    ...utm,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
  };
}

/**
 * Track a page view. Sends to /api/track via fetch+keepalive (survives navigation).
 */
export async function trackPageView(path: string, title?: string): Promise<void> {
  if (isServer()) return;

  const body = JSON.stringify({
    session_id: getSessionId(),
    path,
    title: title || document.title,
    initial_page: getInitialPage(),
    initial_referrer: getInitialReferrer(),
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    ...getUtmParams(),
  });

  try {
    // sendBeacon is fire-and-forget; good for page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // Tracking failures must never break the page
  }
}

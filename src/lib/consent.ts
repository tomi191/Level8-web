const CONSENT_KEY = "level8_cookie_consent";

export type ConsentValue = "accepted" | "declined";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
}

export function setConsent(value: ConsentValue): void {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent("consentChanged"));
}

export function resetConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
  window.dispatchEvent(new CustomEvent("consentChanged"));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

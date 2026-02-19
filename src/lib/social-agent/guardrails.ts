/**
 * Social Commerce Agent — Guardrails
 *
 * Content filtering, escalation detection, confidence scoring.
 * Protects against inappropriate AI responses.
 */

const COMPETITOR_NAMES = [
  "devrix", "dev.bg", "dream host", "superhosting",
  "jump.bg", "accella", "netpeak", "уебтехника",
  "idea studio", "pixeldesign",
];

const PROFANITY_PATTERNS = [
  /\bмайна\b/i, /\bгъз\b/i, /\bпедал\b/i,
  /\bдебил\b/i, /\bидиот\b/i, /\bкурв[аи]\b/i,
  /\bfuck\b/i, /\bshit\b/i, /\bass\b/i, /\bbitch\b/i,
];

const INTERNAL_DATA_PATTERNS = [
  /supabase/i, /api[_\s]?key/i, /secret/i,
  /password/i, /token/i, /\.env/i,
  /service[_\s]?role/i, /admin[_\s]?panel/i,
];

const DEFAULT_ESCALATION_KEYWORDS = [
  "цена", "оферта", "среща", "проблем", "оплакване",
  "жалба", "рекламация", "връщане", "гаранция",
  "price", "quote", "meeting", "complaint", "refund",
];

/**
 * Check if AI response contains forbidden content.
 * Returns null if clean, or a reason string if blocked.
 */
export function filterResponse(content: string): string | null {
  const lower = content.toLowerCase();

  // Check competitor names
  for (const name of COMPETITOR_NAMES) {
    if (lower.includes(name)) {
      return `Contains competitor name: ${name}`;
    }
  }

  // Check profanity
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) {
      return "Contains profanity";
    }
  }

  // Check internal data leaks
  for (const pattern of INTERNAL_DATA_PATTERNS) {
    if (pattern.test(content)) {
      return "Contains potential internal data";
    }
  }

  return null;
}

/**
 * Detect if a message should trigger human escalation.
 * Checks both inbound user message and AI response.
 */
export function detectEscalation(
  text: string,
  customKeywords?: string[]
): { shouldEscalate: boolean; reason?: string } {
  const keywords = customKeywords || DEFAULT_ESCALATION_KEYWORDS;
  const lower = text.toLowerCase();

  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      return {
        shouldEscalate: true,
        reason: `Escalation keyword detected: "${keyword}"`,
      };
    }
  }

  return { shouldEscalate: false };
}

/**
 * Parse AI confidence score from response.
 * Returns 0.5 if parsing fails (conservative default).
 */
export function parseConfidence(response: string): number {
  const cleaned = response.trim();
  const num = parseFloat(cleaned);

  if (isNaN(num) || num < 0 || num > 1) {
    return 0.5;
  }

  return Math.round(num * 100) / 100;
}

/**
 * Determine approval status based on confidence and config.
 */
export function determineApproval(
  confidence: number,
  autoRespond: boolean,
  shouldEscalate: boolean
): "auto_approved" | "pending" {
  if (shouldEscalate) return "pending";
  if (!autoRespond) return "pending";
  if (confidence < 0.6) return "pending";
  return "auto_approved";
}

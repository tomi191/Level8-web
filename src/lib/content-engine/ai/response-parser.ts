/**
 * AI Response Parser
 *
 * Robust JSON parsing with auto-repair for AI model responses.
 * AI models often return slightly malformed JSON — this module handles that.
 */

/**
 * Parse a JSON response from an AI model.
 * Tries multiple strategies: direct parse → repair → regex extraction.
 */
export function parseJSONResponse<T extends Record<string, unknown>>(
  aiResponse: string,
  requiredFields: string[] = []
): T {
  let cleanResponse = aiResponse.trim();

  // Remove markdown code block markers
  cleanResponse = cleanResponse
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');

  // Extract JSON object if there's extra text
  const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanResponse = jsonMatch[0];
  }

  // Strategy 1: Direct parse
  try {
    const parsed = JSON.parse(cleanResponse) as T;
    validateFields(parsed, requiredFields);
    return parsed;
  } catch {
    // Fall through to repair
  }

  // Strategy 2: Fix common JSON issues (control characters in strings)
  try {
    let repaired = cleanResponse;

    // Fix control characters inside string values
    const stringFields = [...requiredFields, 'content', 'excerpt', 'description', 'title'];
    for (const field of stringFields) {
      const regex = new RegExp(`"${field}":\\s*"([\\s\\S]*?)"(?=\\s*[,}])`, 'g');
      repaired = repaired.replace(regex, (match, value) => {
        const escaped = value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/[\x00-\x1F\x7F]/g, '');
        return `"${field}": "${escaped}"`;
      });
    }

    const parsed = JSON.parse(repaired) as T;
    validateFields(parsed, requiredFields);
    return parsed;
  } catch {
    // Fall through to regex
  }

  // Strategy 3: Manual regex extraction
  try {
    const result: Record<string, unknown> = {};

    for (const field of requiredFields) {
      const fieldMatch = cleanResponse.match(new RegExp(`"${field}":\\s*"([^"]*)"`, 's'));
      if (fieldMatch) {
        result[field] = fieldMatch[1];
      }
    }

    // Try to extract arrays
    const arrayMatch = cleanResponse.match(/"keywords":\s*\[([\s\S]*?)\]/);
    if (arrayMatch) {
      const items = arrayMatch[1].match(/"([^"]+)"/g);
      result.keywords = items ? items.map((k) => k.replace(/"/g, '')) : [];
    }

    // Try to extract content (usually the longest field)
    const contentMatch = cleanResponse.match(/"content":\s*"([\s\S]*?)"\s*,\s*"keywords"/);
    if (contentMatch) {
      result.content = contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }

    if (Object.keys(result).length > 0) {
      return result as T;
    }
  } catch {
    // All strategies failed
  }

  throw new Error(
    'Failed to parse AI response. All parsing strategies failed. ' +
    `Response preview: ${cleanResponse.substring(0, 200)}`
  );
}

function validateFields(obj: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

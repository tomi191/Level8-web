/**
 * Slug Generator & Text Metrics
 *
 * Cyrillic → Latin transliteration and content metrics.
 */

const CYRILLIC_TO_LATIN: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
  'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ж': 'Zh', 'З': 'Z',
  'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P',
  'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
  'Ш': 'Sh', 'Щ': 'Sht', 'Ъ': 'A', 'Ь': 'Y', 'Ю': 'Yu', 'Я': 'Ya',
};

/**
 * Generate a URL-friendly slug from a title.
 * Handles Cyrillic → Latin transliteration.
 *
 * @example
 * ```ts
 * generateSlug('Ретрограден Меркурий 2026') // → 'retrograden-merkuriy-2026'
 * generateSlug('Hello World!') // → 'hello-world'
 * ```
 */
export function generateSlug(title: string, maxLength: number = 100): string {
  return title
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

/**
 * Calculate reading time in minutes.
 * Default reading speed: 200 words/min (suitable for most languages).
 */
export function calculateReadingTime(htmlContent: string, wordsPerMinute: number = 200): number {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Calculate word count from HTML content.
 */
export function calculateWordCount(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, '');
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

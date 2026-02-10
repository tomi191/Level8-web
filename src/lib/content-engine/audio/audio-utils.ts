/**
 * Audio Utilities
 *
 * HTML → plain text conversion, text chunking for TTS,
 * and buffer concatenation for MP3 files.
 */

/**
 * Strip HTML tags and prepare text for TTS.
 * Adds natural pauses at block element boundaries.
 */
export function stripHtmlForTTS(html: string): string {
  return html
    // Remove script and style tags completely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Replace common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Add pauses for block elements
    .replace(/<\/p>/gi, '. ')
    .replace(/<\/h[1-6]>/gi, '. ')
    .replace(/<\/li>/gi, '. ')
    .replace(/<br\s*\/?>/gi, '. ')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .trim();
}

/**
 * Split text into chunks at sentence boundaries.
 *
 * Google Cloud TTS has a 5000 BYTE limit per request.
 * For Cyrillic (2 bytes/char), use maxChunkSize=2000 to be safe.
 * For Latin text, maxChunkSize=4500 is fine.
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = 2000): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  // Split by sentences
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    // Single sentence too long — split by words
    if (sentence.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const words = sentence.split(/\s+/);
      let wordChunk = '';

      for (const word of words) {
        if ((wordChunk + ' ' + word).length > maxChunkSize) {
          if (wordChunk) chunks.push(wordChunk.trim());
          wordChunk = word;
        } else {
          wordChunk = wordChunk ? wordChunk + ' ' + word : word;
        }
      }

      if (wordChunk) {
        currentChunk = wordChunk;
      }
    } else if ((currentChunk + ' ' + sentence).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Concatenate multiple MP3 buffers into a single buffer.
 * Simple concatenation works for MP3 files.
 */
export function concatenateAudioBuffers(buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers);
}

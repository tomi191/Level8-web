/**
 * Gemini TTS — Text-to-Speech via Gemini 2.5 Flash Preview TTS
 *
 * Uses the Gemini multimodal API with responseModalities: ["AUDIO"].
 * Returns WAV (24kHz PCM mono) which browsers play natively.
 *
 * Auth: GEMINI_API_KEY (simple API key, no JWT needed).
 * Limit: ~4000 bytes per request — use maxChunkSize=1500 for Cyrillic safety.
 */

import type { ContentEngineConfig } from "../config";
import type { TTSResult } from "../types";
import {
  stripHtmlForTTS,
  splitTextIntoChunks,
  concatenateAudioBuffers,
} from "./audio-utils";

const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Max chars per chunk — Cyrillic is 2 bytes/char, API limit ~4000 bytes */
const MAX_CHUNK_SIZE = 1500;

/**
 * Available Gemini TTS voices.
 * See: https://ai.google.dev/gemini-api/docs/text-to-speech
 */
export const GEMINI_VOICES = [
  "Aoede", "Charon", "Fenrir", "Kore", "Puck",
  "Leda", "Orus", "Zephyr",
] as const;

export type GeminiVoice = (typeof GEMINI_VOICES)[number];

interface GeminiTTSResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType: string;
          data: string; // base64
        };
      }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

/**
 * Synthesize a single text chunk via Gemini TTS.
 * Returns raw WAV buffer (base64-decoded from response).
 */
async function synthesizeChunk(
  text: string,
  apiKey: string,
  voiceName: string
): Promise<Buffer> {
  const url = `${GEMINI_API_BASE}/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(120_000), // 2 min per chunk
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini TTS HTTP ${response.status}: ${errorText}`);
  }

  const data: GeminiTTSResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini TTS error: ${data.error.message}`);
  }

  const candidate = data.candidates?.[0];
  const audioData = candidate?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    const reason = candidate?.finishReason ?? "unknown";
    throw new Error(`No audio data in Gemini TTS response (finishReason: ${reason}). The preview model may be temporarily unavailable.`);
  }

  return Buffer.from(audioData, "base64");
}

/**
 * Find a RIFF chunk by its 4-char ID. Returns { offset, size } of the chunk data,
 * or null if not found. Searches from byte 12 (after RIFF header).
 */
function findWavChunk(
  buf: Buffer,
  chunkId: string
): { offset: number; size: number } | null {
  let pos = 12; // skip RIFF header (4 + 4 + 4)
  while (pos + 8 <= buf.length) {
    const id = buf.subarray(pos, pos + 4).toString("ascii");
    const size = buf.readUInt32LE(pos + 4);
    if (id === chunkId) {
      return { offset: pos + 8, size };
    }
    pos += 8 + size;
    // WAV chunks are word-aligned (pad to even)
    if (size % 2 !== 0) pos++;
  }
  return null;
}

/**
 * Concatenate WAV buffers by properly parsing each WAV's fmt and data chunks.
 * Handles non-standard headers (extra chunks between fmt and data).
 */
function concatenateWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) throw new Error("No WAV buffers to concatenate");
  if (buffers.length === 1) return buffers[0];

  // Read format from first WAV's fmt chunk
  const first = buffers[0];
  const fmtChunk = findWavChunk(first, "fmt ");
  if (!fmtChunk) throw new Error("No fmt chunk in first WAV buffer");

  const fmtOffset = fmtChunk.offset;
  const numChannels = first.readUInt16LE(fmtOffset + 2);
  const sampleRate = first.readUInt32LE(fmtOffset + 4);
  const bitsPerSample = first.readUInt16LE(fmtOffset + 14);
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  // Extract raw PCM data from each WAV's data chunk
  const pcmChunks: Buffer[] = [];
  for (const buf of buffers) {
    const dataChunk = findWavChunk(buf, "data");
    if (!dataChunk) continue;
    pcmChunks.push(buf.subarray(dataChunk.offset, dataChunk.offset + dataChunk.size));
  }

  const totalPcmSize = pcmChunks.reduce((sum, c) => sum + c.length, 0);

  // Build clean 44-byte WAV header
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + totalPcmSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(totalPcmSize, 40);

  return Buffer.concat([header, ...pcmChunks]);
}

/**
 * Generate TTS audio from HTML content using Gemini.
 *
 * @example
 * ```ts
 * const result = await generateGeminiTTS(config, '<p>Здравейте!</p>', 'Kore');
 * // result.buffer is a WAV file
 * ```
 */
export async function generateGeminiTTS(
  config: ContentEngineConfig,
  htmlContent: string,
  voiceName: string = "Kore"
): Promise<TTSResult> {
  if (!config.geminiTts) {
    throw new Error("Gemini TTS config not set. Provide geminiTts in config.");
  }

  const { apiKey } = config.geminiTts;
  const log = config.logger;

  // Strip HTML
  const plainText = stripHtmlForTTS(htmlContent);

  // Chunk text (smaller chunks for Cyrillic)
  const chunks = splitTextIntoChunks(plainText, MAX_CHUNK_SIZE);
  log?.info(`[Gemini TTS] Processing ${chunks.length} chunks, voice: ${voiceName}`);

  // Synthesize each chunk (with 1 retry on failure)
  const audioBuffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    log?.info(`[Gemini TTS] Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
    let buffer: Buffer;
    try {
      buffer = await synthesizeChunk(chunks[i], apiKey, voiceName);
    } catch (err) {
      log?.info(`[Gemini TTS] Chunk ${i + 1} failed, retrying in 3s...`);
      await new Promise((r) => setTimeout(r, 3000));
      buffer = await synthesizeChunk(chunks[i], apiKey, voiceName);
    }
    audioBuffers.push(buffer);

    // Delay between chunks to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Concatenate WAV buffers
  const combined = concatenateWavBuffers(audioBuffers);

  return {
    buffer: combined,
    contentType: "audio/wav",
    charCount: plainText.length,
    chunks: chunks.length,
    fileSizeKB: Math.round(combined.length / 1024),
  };
}

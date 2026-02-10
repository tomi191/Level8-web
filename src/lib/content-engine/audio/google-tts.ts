/**
 * Google Cloud Text-to-Speech
 *
 * Supports full articles by chunking text and concatenating audio.
 * Uses JWT auth with service account (no SDK dependency).
 *
 * Requires: `jose` npm package for JWT signing.
 */

import { SignJWT, importPKCS8 } from 'jose';
import type { ContentEngineConfig } from '../config';
import type { TTSResult, TTSVoice } from '../types';
import { stripHtmlForTTS, splitTextIntoChunks, concatenateAudioBuffers } from './audio-utils';

// ============ VOICE PRESETS ============

/**
 * Add your language voices here.
 * See: https://cloud.google.com/text-to-speech/docs/voices
 */
export const GOOGLE_VOICES: Record<string, TTSVoice & { languageCode: string; ssmlGender: string }> = {
  'en-US-female': {
    id: 'en-US-Neural2-F',
    name: 'English Female',
    description: 'US English neural female voice',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
  },
  'en-US-male': {
    id: 'en-US-Neural2-D',
    name: 'English Male',
    description: 'US English neural male voice',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
  },
  'bg-BG-female': {
    id: 'bg-BG-Standard-A',
    name: 'Bulgarian Female',
    description: 'Bulgarian standard female voice',
    languageCode: 'bg-BG',
    ssmlGender: 'FEMALE',
  },
};

const DEFAULT_AUDIO_CONFIG = {
  audioEncoding: 'MP3' as const,
  speakingRate: 0.95,
  pitch: 0,
  volumeGainDb: 0,
  effectsProfileId: ['headphone-class-device'],
};

// ============ AUTH ============

/**
 * Generate a Google Cloud access token using service account JWT.
 */
async function getGoogleAccessToken(
  clientEmail: string,
  privateKey: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const pk = await importPKCS8(privateKey, 'RS256');

  const jwt = await new SignJWT({
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(pk);

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Google auth failed: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// ============ TTS ============

/**
 * Generate audio for a single text chunk.
 */
async function synthesizeChunk(
  text: string,
  accessToken: string,
  voice: { languageCode: string; name: string; ssmlGender: string }
): Promise<Buffer> {
  const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.ssmlGender,
      },
      audioConfig: DEFAULT_AUDIO_CONFIG,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Google TTS error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  if (!data.audioContent) {
    throw new Error('No audio content in TTS response');
  }

  return Buffer.from(data.audioContent, 'base64');
}

/**
 * Generate TTS audio from HTML content.
 * Strips HTML, chunks text, synthesizes each chunk, concatenates.
 *
 * @example
 * ```ts
 * const result = await generateGoogleTTS(config, '<p>Hello world</p>', 'en-US-female');
 * fs.writeFileSync('output.mp3', result.buffer);
 * ```
 */
export async function generateGoogleTTS(
  config: ContentEngineConfig,
  htmlContent: string,
  voiceKey: string = 'en-US-female'
): Promise<TTSResult> {
  if (!config.googleCloud) {
    throw new Error('Google Cloud config not set. Provide googleCloud in config.');
  }

  const voice = GOOGLE_VOICES[voiceKey];
  if (!voice) {
    throw new Error(`Unknown voice: ${voiceKey}. Available: ${Object.keys(GOOGLE_VOICES).join(', ')}`);
  }

  const log = config.logger;

  // Strip HTML
  const plainText = stripHtmlForTTS(htmlContent);

  // Get access token
  const accessToken = await getGoogleAccessToken(
    config.googleCloud.clientEmail,
    config.googleCloud.privateKey
  );

  // Chunk text
  const chunks = splitTextIntoChunks(plainText);
  log?.info(`Processing ${chunks.length} TTS chunks`);

  // Synthesize each chunk
  const audioBuffers: Buffer[] = [];
  for (let i = 0; i < chunks.length; i++) {
    log?.info(`Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
    const buffer = await synthesizeChunk(chunks[i], accessToken, voice);
    audioBuffers.push(buffer);

    // Small delay between chunks to avoid rate limiting
    if (i < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // Concatenate
  const combined = concatenateAudioBuffers(audioBuffers);

  return {
    buffer: combined,
    contentType: 'audio/mpeg',
    charCount: plainText.length,
    chunks: chunks.length,
    fileSizeKB: Math.round(combined.length / 1024),
  };
}

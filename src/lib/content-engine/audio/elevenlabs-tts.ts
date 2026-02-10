/**
 * ElevenLabs Text-to-Speech
 *
 * Premium TTS with multilingual support via Multilingual v2 model.
 */

import type { ContentEngineConfig } from '../config';
import type { TTSVoice } from '../types';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const MULTILINGUAL_V2_MODEL = 'eleven_multilingual_v2';

// ============ VOICE PRESETS ============

/**
 * Built-in ElevenLabs voices. Add your custom voices here.
 */
export const ELEVENLABS_VOICES: Record<string, TTSVoice> = {
  rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm and natural' },
  bella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft and warm' },
  elli: { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young and bright' },
  adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep and authoritative' },
  antoni: { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Well-rounded and clear' },
};

export interface ElevenLabsOptions {
  /** Voice key from ELEVENLABS_VOICES, or a custom voice ID */
  voiceId?: string;
  /** Stability (0-1, default 0.5) */
  stability?: number;
  /** Similarity boost (0-1, default 0.75) */
  similarityBoost?: number;
  /** Max text length to process */
  maxTextLength?: number;
}

/**
 * Generate TTS audio via ElevenLabs.
 * Returns audio as a base64-encoded MP3 string.
 *
 * @example
 * ```ts
 * const audio = await generateElevenLabsTTS(config, 'Hello world!');
 * // audio.base64 contains the MP3 data
 * const buffer = Buffer.from(audio.base64, 'base64');
 * ```
 */
export async function generateElevenLabsTTS(
  config: ContentEngineConfig,
  text: string,
  options: ElevenLabsOptions = {}
): Promise<{
  base64: string;
  contentType: string;
  charCount: number;
  voiceName: string;
}> {
  if (!config.elevenLabs?.apiKey) {
    throw new Error('ElevenLabs API key not configured. Set config.elevenLabs.');
  }

  const maxLen = options.maxTextLength ?? 5000;
  const truncated = text.substring(0, maxLen);

  // Resolve voice ID
  let voiceId = options.voiceId || config.elevenLabs.defaultVoiceId;
  let voiceName = 'Custom';

  const preset = ELEVENLABS_VOICES[voiceId];
  if (preset) {
    voiceName = preset.name;
    voiceId = preset.id;
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': config.elevenLabs.apiKey,
    },
    body: JSON.stringify({
      text: truncated,
      model_id: MULTILINGUAL_V2_MODEL,
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 429) {
      throw new Error('ElevenLabs quota exceeded. Try again later.');
    }

    throw new Error(`ElevenLabs TTS error (${response.status}): ${JSON.stringify(errorData)}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(audioBuffer).toString('base64');

  return {
    base64,
    contentType: 'audio/mpeg',
    charCount: truncated.length,
    voiceName,
  };
}

/**
 * List available ElevenLabs voices.
 */
export function listVoices(): TTSVoice[] {
  return Object.entries(ELEVENLABS_VOICES).map(([key, v]) => ({
    id: key,
    name: v.name,
    description: v.description,
  }));
}

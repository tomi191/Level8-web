/**
 * Example: Generate Audio (TTS)
 *
 * Usage: npx tsx content-engine/examples/generate-audio.ts
 *
 * Requires: Google Cloud service account OR ElevenLabs API key
 */

import * as fs from 'fs';
import { createDefaultConfig } from '../config';
import { generateGoogleTTS } from '../audio/google-tts';
import { generateElevenLabsTTS } from '../audio/elevenlabs-tts';

async function main() {
  const config = createDefaultConfig();

  const sampleHtml = `
    <h2>The Power of Morning Routines</h2>
    <p>Starting your day with intention can transform your entire life.
    Research shows that people who follow a consistent morning routine
    are more productive, less stressed, and happier overall.</p>
    <p>Here are three simple steps to build your ideal morning:</p>
    <ul>
      <li>Wake up at the same time every day</li>
      <li>Spend 10 minutes in quiet reflection or meditation</li>
      <li>Move your body for at least 15 minutes</li>
    </ul>
  `;

  // Try Google Cloud TTS first
  if (config.googleCloud) {
    console.log('Generating audio with Google Cloud TTS...\n');

    const result = await generateGoogleTTS(config, sampleHtml, 'en-US-female');

    const outputPath = './output-google-tts.mp3';
    fs.writeFileSync(outputPath, result.buffer);

    console.log(`Google TTS: ${result.fileSizeKB} KB, ${result.chunks} chunks, ${result.charCount} chars`);
    console.log(`Saved to: ${outputPath}`);
    return;
  }

  // Try ElevenLabs
  if (config.elevenLabs) {
    console.log('Generating audio with ElevenLabs...\n');

    // Strip HTML first for ElevenLabs
    const plainText = sampleHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const result = await generateElevenLabsTTS(config, plainText, {
      voiceId: 'rachel',
    });

    const outputPath = './output-elevenlabs.mp3';
    const buffer = Buffer.from(result.base64, 'base64');
    fs.writeFileSync(outputPath, buffer);

    console.log(`ElevenLabs: ${result.charCount} chars, voice: ${result.voiceName}`);
    console.log(`Saved to: ${outputPath}`);
    return;
  }

  console.error('No TTS provider configured.');
  console.error('Set GOOGLE_CLOUD_CLIENT_EMAIL or ELEVENLABS_API_KEY in your environment.');
}

main().catch(console.error);

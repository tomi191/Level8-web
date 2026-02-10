/**
 * Example: Generate a Video
 *
 * Usage: npx tsx content-engine/examples/generate-video.ts
 *
 * Requires: OPENROUTER_API_KEY + KIE_API_KEY in environment
 */

import { createDefaultConfig } from '../config';
import { generateFullVideo } from '../video/video-generator';

async function main() {
  const config = createDefaultConfig();

  if (!config.openrouterApiKey || !config.kieApiKey) {
    console.error('Missing OPENROUTER_API_KEY or KIE_API_KEY');
    process.exit(1);
  }

  console.log('Generating video...\n');

  const { script, video } = await generateFullVideo(
    config,
    '3 productivity tips that actually work',
    {
      visualStyle:
        'Realistic UGC-style video of a professional woman speaking directly to camera, natural lighting, office background.',
      language: 'English',
      maxWords: 45,
      aspectRatio: 'portrait',
      frames: '15',
    }
  );

  console.log('=== RESULT ===\n');
  console.log(`Script (${script.wordCount} words, ~${script.estimatedDuration}s):`);
  console.log(`"${script.script}"\n`);
  console.log(`Video URL: ${video.videoUrl}`);
  console.log(`Generated in: ${video.generationTimeSeconds}s`);
}

main().catch(console.error);

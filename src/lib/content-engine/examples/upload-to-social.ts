/**
 * Example: Upload Video to Social Media
 *
 * Usage: npx tsx content-engine/examples/upload-to-social.ts
 *
 * Requires: YouTube/Instagram/Facebook credentials in environment
 */

import { createDefaultConfig } from '../config';
import { uploadToAll, getUploadSummary } from '../social/upload-orchestrator';

async function main() {
  const config = createDefaultConfig();

  // Replace with your actual video URL
  const videoUrl = 'https://example.com/your-video.mp4';

  const metadata = {
    title: 'My Amazing Video',
    description: 'Check out this video! #tips #shorts',
    tags: ['tips', 'shorts', 'tutorial'],
  };

  console.log('Uploading to social media platforms...\n');

  const result = await uploadToAll(config, videoUrl, metadata, {
    // Optionally specify which platforms (default: all configured)
    // platforms: ['youtube', 'instagram', 'facebook_feed'],
    delayBetweenUploads: 2000,
  });

  // Print summary
  const summary = getUploadSummary(result.uploads);

  console.log('\n=== UPLOAD SUMMARY ===\n');
  console.log(`Total: ${summary.total} | Success: ${summary.successful} | Failed: ${summary.failed}`);
  console.log(`Time: ${result.totalTime}s\n`);

  for (const [platform, info] of Object.entries(summary.byPlatform)) {
    if (info.success) {
      console.log(`  ${platform}: ${info.url}`);
    } else {
      console.log(`  ${platform}: FAILED - ${info.error}`);
    }
  }
}

main().catch(console.error);

/**
 * Upload Orchestrator
 *
 * Coordinates multi-platform uploads (YouTube, Instagram, Facebook).
 */

import type { ContentEngineConfig } from '../config';
import type { SocialMediaMetadata, SocialPlatform, UploadResult, UploadOrchestratorResult } from '../types';
import { uploadToYouTube } from './youtube';
import { uploadToInstagram } from './instagram';
import { uploadToFacebookFeed, uploadToFacebookStory } from './facebook';

export interface OrchestratorOptions {
  /** Platforms to upload to (default: all configured) */
  platforms?: SocialPlatform[];
  /** Delay between uploads in ms (default: 2000) */
  delayBetweenUploads?: number;
}

/**
 * Upload a video to multiple social media platforms.
 *
 * @example
 * ```ts
 * const result = await uploadToAll(config, 'https://example.com/video.mp4', {
 *   title: 'My Video',
 *   description: 'Check this out!',
 *   tags: ['tips', 'tutorial'],
 * });
 *
 * for (const upload of result.uploads) {
 *   console.log(`${upload.platform}: ${upload.success ? upload.url : upload.error}`);
 * }
 * ```
 */
export async function uploadToAll(
  config: ContentEngineConfig,
  videoUrl: string,
  metadata: SocialMediaMetadata,
  options: OrchestratorOptions = {}
): Promise<UploadOrchestratorResult> {
  const startTime = Date.now();
  const log = config.logger;
  const delay = options.delayBetweenUploads ?? 2000;

  // Determine which platforms to upload to
  const platforms = options.platforms || getConfiguredPlatforms(config);

  log?.info(`Uploading to ${platforms.length} platforms: ${platforms.join(', ')}`);

  const uploads: UploadResult[] = [];

  for (const platform of platforms) {
    try {
      let result: UploadResult;

      switch (platform) {
        case 'youtube':
          result = await uploadToYouTube(config, videoUrl, metadata);
          break;
        case 'instagram':
          result = await uploadToInstagram(config, videoUrl, metadata);
          break;
        case 'facebook_feed':
          result = await uploadToFacebookFeed(config, videoUrl, metadata);
          break;
        case 'facebook_story':
          result = await uploadToFacebookStory(config, videoUrl, metadata);
          break;
        default:
          result = { platform, success: false, error: `Unsupported platform: ${platform}` };
      }

      uploads.push(result);

      if (result.success) {
        log?.info(`${platform}: ${result.url}`);
      } else {
        log?.warn(`${platform}: failed - ${result.error}`);
      }
    } catch (error) {
      uploads.push({
        platform,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Delay between uploads
    if (delay > 0 && platforms.indexOf(platform) < platforms.length - 1) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  const totalTime = Math.round((Date.now() - startTime) / 1000);

  const successful = uploads.filter((u) => u.success);
  log?.info(`Upload complete: ${successful.length}/${uploads.length} succeeded in ${totalTime}s`);

  return { uploads, totalTime };
}

/**
 * Get list of platforms that are configured.
 */
function getConfiguredPlatforms(config: ContentEngineConfig): SocialPlatform[] {
  const platforms: SocialPlatform[] = [];

  if (config.youtube) platforms.push('youtube');
  if (config.instagram) platforms.push('instagram');
  if (config.facebook) platforms.push('facebook_feed');

  return platforms;
}

/**
 * Get a summary of upload results.
 */
export function getUploadSummary(results: UploadResult[]): {
  total: number;
  successful: number;
  failed: number;
  byPlatform: Record<string, { success: boolean; url?: string; error?: string }>;
} {
  const byPlatform: Record<string, { success: boolean; url?: string; error?: string }> = {};

  for (const r of results) {
    byPlatform[r.platform] = {
      success: r.success,
      url: r.url,
      error: r.error,
    };
  }

  return {
    total: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    byPlatform,
  };
}

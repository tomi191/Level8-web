/**
 * Instagram Reels Upload
 *
 * Uses Meta Graph API v18.0 with container workflow:
 * 1. Create container (media object)
 * 2. Wait for processing
 * 3. Publish
 */

import type { ContentEngineConfig } from '../config';
import type { SocialMediaMetadata, UploadResult } from '../types';

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

/**
 * Upload a video as an Instagram Reel.
 *
 * @param videoUrl - Public URL of the video file
 * @param metadata - Caption for the reel
 *
 * @example
 * ```ts
 * const result = await uploadToInstagram(config, 'https://example.com/video.mp4', {
 *   title: 'My Reel',
 *   description: 'Caption here #hashtag',
 * });
 * ```
 */
export async function uploadToInstagram(
  config: ContentEngineConfig,
  videoUrl: string,
  metadata: SocialMediaMetadata
): Promise<UploadResult> {
  const log = config.logger;

  try {
    if (!config.instagram) throw new Error('Instagram config not set');
    const { accountId, accessToken } = config.instagram;

    log?.info('Uploading to Instagram', { title: metadata.title });

    // Step 1: Create container
    const createResponse = await fetch(`${GRAPH_API_BASE}/${accountId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: metadata.description,
        share_to_feed: true,
        access_token: accessToken,
      }),
    });

    const createData = await createResponse.json();
    if (createData.error) {
      throw new Error(`Instagram container error: ${createData.error.message}`);
    }

    const containerId = createData.id;
    log?.info(`Container created: ${containerId}`);

    // Step 2: Poll until processed
    let status = '';
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const statusResponse = await fetch(
        `${GRAPH_API_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusResponse.json();
      status = statusData.status_code;

      if (status === 'FINISHED') break;
      if (status === 'ERROR') throw new Error('Instagram processing failed');

      if ((i + 1) % 6 === 0) {
        log?.info(`Instagram processing... (${(i + 1) * 5}s, status: ${status})`);
      }
    }

    if (status !== 'FINISHED') {
      throw new Error('Instagram processing timed out');
    }

    // Step 3: Publish
    const publishResponse = await fetch(`${GRAPH_API_BASE}/${accountId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishResponse.json();
    if (publishData.error) {
      throw new Error(`Instagram publish error: ${publishData.error.message}`);
    }

    const mediaId = publishData.id;
    log?.info('Instagram upload complete', { mediaId });

    return {
      platform: 'instagram',
      success: true,
      url: `https://www.instagram.com/reel/${mediaId}`,
      postId: mediaId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log?.error('Instagram upload failed', { error: msg });
    return { platform: 'instagram', success: false, error: msg };
  }
}

/**
 * Facebook Video Upload
 *
 * Supports Feed video (direct upload) and Story (3-phase upload).
 */

import type { ContentEngineConfig } from '../config';
import type { SocialMediaMetadata, UploadResult } from '../types';

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

/**
 * Upload a video to Facebook page feed.
 *
 * @param videoUrl - Public URL of the video file
 * @param metadata - Title and description
 */
export async function uploadToFacebookFeed(
  config: ContentEngineConfig,
  videoUrl: string,
  metadata: SocialMediaMetadata
): Promise<UploadResult> {
  const log = config.logger;

  try {
    if (!config.facebook) throw new Error('Facebook config not set');
    const { pageId, accessToken } = config.facebook;

    log?.info('Uploading to Facebook Feed', { title: metadata.title });

    const response = await fetch(`${GRAPH_API_BASE}/${pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: videoUrl,
        title: metadata.title,
        description: metadata.description,
        access_token: accessToken,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`Facebook Feed error: ${data.error.message}`);
    }

    const postId = data.id;
    log?.info('Facebook Feed upload complete', { postId });

    return {
      platform: 'facebook_feed',
      success: true,
      url: `https://www.facebook.com/${pageId}/videos/${postId}`,
      postId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log?.error('Facebook Feed upload failed', { error: msg });
    return { platform: 'facebook_feed', success: false, error: msg };
  }
}

/**
 * Upload a video as a Facebook Story (3-phase upload).
 *
 * Phase 1: Start upload session
 * Phase 2: Upload video data
 * Phase 3: Finish and publish
 */
export async function uploadToFacebookStory(
  config: ContentEngineConfig,
  videoUrl: string,
  metadata: SocialMediaMetadata
): Promise<UploadResult> {
  const log = config.logger;

  try {
    if (!config.facebook) throw new Error('Facebook config not set');
    const { pageId, accessToken } = config.facebook;

    log?.info('Uploading to Facebook Story');

    // Download video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) throw new Error('Failed to download video');
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

    // Phase 1: Start
    const startResponse = await fetch(`${GRAPH_API_BASE}/${pageId}/video_stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'start',
        access_token: accessToken,
      }),
    });

    const startData = await startResponse.json();
    if (startData.error) throw new Error(`Story start failed: ${startData.error.message}`);

    const videoId = startData.video_id;

    // Phase 2: Upload
    const formData = new FormData();
    formData.append('upload_phase', 'transfer');
    formData.append('access_token', accessToken);
    formData.append('start_offset', '0');
    formData.append('video_file_chunk', new Blob([videoBuffer], { type: 'video/mp4' }));

    const transferResponse = await fetch(`${GRAPH_API_BASE}/${videoId}`, {
      method: 'POST',
      body: formData,
    });

    const transferData = await transferResponse.json();
    if (transferData.error) throw new Error(`Story transfer failed: ${transferData.error.message}`);

    // Phase 3: Finish
    const finishResponse = await fetch(`${GRAPH_API_BASE}/${pageId}/video_stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upload_phase: 'finish',
        video_id: videoId,
        title: metadata.title,
        description: metadata.description,
        access_token: accessToken,
      }),
    });

    const finishData = await finishResponse.json();
    if (finishData.error) throw new Error(`Story finish failed: ${finishData.error.message}`);

    log?.info('Facebook Story upload complete', { videoId });

    return {
      platform: 'facebook_story',
      success: true,
      url: `https://www.facebook.com/stories/${pageId}`,
      postId: finishData.post_id || videoId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log?.error('Facebook Story upload failed', { error: msg });
    return { platform: 'facebook_story', success: false, error: msg };
  }
}

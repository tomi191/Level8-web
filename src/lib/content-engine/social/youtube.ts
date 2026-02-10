/**
 * YouTube Shorts Upload
 *
 * Uses YouTube Data API v3 with OAuth2 refresh token flow.
 * Supports resumable uploads for reliability.
 */

import type { ContentEngineConfig } from '../config';
import type { SocialMediaMetadata, UploadResult } from '../types';

const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';

/**
 * Get a fresh YouTube access token using refresh token.
 */
async function getYouTubeAccessToken(config: ContentEngineConfig): Promise<string> {
  if (!config.youtube) throw new Error('YouTube config not set');

  const response = await fetch(YOUTUBE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.youtube.clientId,
      client_secret: config.youtube.clientSecret,
      refresh_token: config.youtube.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YouTube token refresh failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Upload a video to YouTube Shorts.
 *
 * @param videoUrl - Public URL of the video file to upload
 * @param metadata - Title, description, tags
 *
 * @example
 * ```ts
 * const result = await uploadToYouTube(config, 'https://example.com/video.mp4', {
 *   title: 'My Short',
 *   description: 'Check this out!',
 *   tags: ['shorts', 'tips'],
 * });
 * console.log(result.url); // https://www.youtube.com/shorts/xxxxx
 * ```
 */
export async function uploadToYouTube(
  config: ContentEngineConfig,
  videoUrl: string,
  metadata: SocialMediaMetadata
): Promise<UploadResult> {
  const log = config.logger;

  try {
    log?.info('Uploading to YouTube', { title: metadata.title });

    // Get access token
    const accessToken = await getYouTubeAccessToken(config);

    // Download video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) throw new Error('Failed to download video');
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

    // Step 1: Initiate resumable upload
    const initResponse = await fetch(
      `${YOUTUBE_UPLOAD_URL}?uploadType=resumable&part=snippet,status`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/mp4',
          'X-Upload-Content-Length': String(videoBuffer.length),
        },
        body: JSON.stringify({
          snippet: {
            title: metadata.title.substring(0, 100),
            description: metadata.description,
            tags: metadata.tags || [],
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: 'public',
            selfDeclaredMadeForKids: false,
            madeForKids: false,
          },
        }),
      }
    );

    if (!initResponse.ok) {
      const error = await initResponse.text();
      throw new Error(`YouTube upload init failed: ${error}`);
    }

    const uploadLocation = initResponse.headers.get('Location');
    if (!uploadLocation) throw new Error('No upload location in YouTube response');

    // Step 2: Upload video data
    const uploadResponse = await fetch(uploadLocation, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBuffer.length),
      },
      body: videoBuffer,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`YouTube video upload failed: ${error}`);
    }

    const uploadData = await uploadResponse.json();
    const videoId = uploadData.id;

    log?.info('YouTube upload complete', { videoId });

    return {
      platform: 'youtube',
      success: true,
      url: `https://www.youtube.com/shorts/${videoId}`,
      postId: videoId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log?.error('YouTube upload failed', { error: msg });
    return { platform: 'youtube', success: false, error: msg };
  }
}

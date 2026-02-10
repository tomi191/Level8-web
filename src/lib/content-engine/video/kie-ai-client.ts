/**
 * Kie.ai Video Generation Client
 *
 * Text-to-video and image-to-video generation using Kie.ai API (Sora 2).
 * Includes polling for task completion.
 */

import type { ContentEngineConfig } from '../config';
import type { VideoGenerationResult } from '../types';

const KIE_API_BASE = 'https://api.kie.ai';
const CREATE_TASK_ENDPOINT = `${KIE_API_BASE}/api/v1/jobs/createTask`;
const RECORD_INFO_ENDPOINT = `${KIE_API_BASE}/api/v1/jobs/recordInfo`;

const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_MAX_ATTEMPTS = 120; // 10 minutes

/**
 * Generate a video from a text prompt using Sora 2.
 *
 * @example
 * ```ts
 * const result = await generateTextToVideo(config, {
 *   prompt: 'A woman speaking to camera about technology',
 *   aspectRatio: 'portrait',
 *   frames: '15',
 * });
 * console.log(result.videoUrl);
 * ```
 */
export async function generateTextToVideo(
  config: ContentEngineConfig,
  options: {
    prompt: string;
    aspectRatio?: string;
    frames?: string;
    model?: string;
    removeWatermark?: boolean;
  }
): Promise<VideoGenerationResult> {
  const model = options.model || config.videoModel || 'sora-2-text-to-video';
  const log = config.logger;

  log?.info('Creating video task', { model, aspectRatio: options.aspectRatio });

  const response = await fetch(CREATE_TASK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.kieApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: {
        prompt: options.prompt,
        aspect_ratio: options.aspectRatio || 'portrait',
        n_frames: options.frames || '15',
        size: 'standard',
        remove_watermark: options.removeWatermark ?? true,
        character_id_list: [],
      },
    }),
  });

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Kie.ai task creation failed: ${result.msg || JSON.stringify(result)}`);
  }

  const taskId = result.data?.taskId;
  if (!taskId) {
    throw new Error('No task ID returned from Kie.ai');
  }

  log?.info(`Task created: ${taskId}`);

  // Poll for result
  const startTime = Date.now();
  const videoUrl = await pollForResult(config, taskId);
  const generationTimeSeconds = Math.round((Date.now() - startTime) / 1000);

  return { videoUrl, taskId, generationTimeSeconds };
}

/**
 * Generate a video from an image (image-to-video).
 */
export async function generateImageToVideo(
  config: ContentEngineConfig,
  options: {
    imageUrl: string;
    prompt?: string;
    model?: string;
    frames?: string;
  }
): Promise<VideoGenerationResult> {
  const model = options.model || 'sora-2-pro-image-to-video';
  const log = config.logger;

  log?.info('Creating image-to-video task');

  const response = await fetch(CREATE_TASK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.kieApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: {
        prompt: options.prompt || 'Gentle cosmic animation with slow ambient motion',
        image_urls: [options.imageUrl],
        aspect_ratio: 'portrait',
        n_frames: options.frames || '24',
        size: 'standard',
        remove_watermark: true,
      },
    }),
  });

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(`Kie.ai image-to-video failed: ${result.msg || JSON.stringify(result)}`);
  }

  const taskId = result.data?.taskId;
  if (!taskId) throw new Error('No task ID');

  const startTime = Date.now();
  const videoUrl = await pollForResult(config, taskId);
  const generationTimeSeconds = Math.round((Date.now() - startTime) / 1000);

  return { videoUrl, taskId, generationTimeSeconds };
}

/**
 * Poll Kie.ai for task completion.
 */
async function pollForResult(
  config: ContentEngineConfig,
  taskId: string,
  pollInterval = DEFAULT_POLL_INTERVAL_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS
): Promise<string> {
  const log = config.logger;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const response = await fetch(`${RECORD_INFO_ENDPOINT}?taskId=${taskId}`, {
      headers: { 'Authorization': `Bearer ${config.kieApiKey}` },
    });

    const result = await response.json();
    const state = result.data?.state;

    if (state === 'success') {
      if (result.data?.resultJson) {
        try {
          const resultData = JSON.parse(result.data.resultJson);
          const url = resultData.resultUrls?.[0] || resultData.videoUrl || resultData.url;
          if (url) {
            log?.info(`Video completed in ${(i + 1) * (pollInterval / 1000)}s`);
            return url;
          }
        } catch {
          // Parse error
        }
      }
      throw new Error('No URL in completed result');
    }

    if (state === 'failed' || state === 'fail') {
      const failMsg = result.data?.failMsg || result.data?.failCode || 'Unknown error';
      throw new Error(`Video generation failed: ${failMsg}`);
    }

    if ((i + 1) % 6 === 0) {
      log?.info(`Still processing... (${(i + 1) * (pollInterval / 1000)}s)`);
    }
  }

  throw new Error('Video generation timed out');
}

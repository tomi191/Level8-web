/**
 * Video Generator
 *
 * High-level API combining script generation + video generation.
 */

import type { ContentEngineConfig } from '../config';
import type { VideoGenerationResult, VideoScriptResult } from '../types';
import { generateVideoScript } from './script-generator';
import { generateTextToVideo } from './kie-ai-client';

export interface VideoGeneratorOptions {
  /** Visual description to prepend to the video prompt */
  visualStyle?: string;
  /** Aspect ratio: "portrait" | "landscape" | "square" */
  aspectRatio?: string;
  /** Number of frames (determines duration) */
  frames?: string;
  /** Video model override */
  model?: string;
  /** Max words for the script */
  maxWords?: number;
  /** Script language */
  language?: string;
}

const DEFAULT_VISUAL_STYLE =
  'Realistic UGC-style video of a person speaking directly to camera in selfie mode. Natural lighting, authentic feel.';

/**
 * Generate a complete video: script + video.
 *
 * @example
 * ```ts
 * const { script, video } = await generateFullVideo(config, 'Top 3 SEO tips', {
 *   visualStyle: 'Professional woman in office setting',
 *   language: 'English',
 * });
 * console.log(script.script);
 * console.log(video.videoUrl);
 * ```
 */
export async function generateFullVideo(
  config: ContentEngineConfig,
  topic: string,
  options: VideoGeneratorOptions = {}
): Promise<{
  script: VideoScriptResult;
  video: VideoGenerationResult;
}> {
  const log = config.logger;

  // Step 1: Generate script
  log?.info('Generating video script', { topic });
  const script = await generateVideoScript(config, {
    topic,
    maxWords: options.maxWords ?? 45,
    language: options.language,
  });
  log?.info(`Script: ${script.wordCount} words, ~${script.estimatedDuration}s`);

  // Step 2: Build video prompt
  const visualStyle = options.visualStyle || DEFAULT_VISUAL_STYLE;
  const videoPrompt = `${visualStyle} "${script.script}" Authentic feel, engaging delivery.`;

  // Step 3: Generate video
  log?.info('Generating video');
  const video = await generateTextToVideo(config, {
    prompt: videoPrompt,
    aspectRatio: options.aspectRatio ?? 'portrait',
    frames: options.frames ?? '15',
    model: options.model,
  });

  log?.info(`Video ready in ${video.generationTimeSeconds}s`, { url: video.videoUrl });

  return { script, video };
}

/**
 * Generate video from an existing script (skip script generation).
 */
export async function generateVideoFromScript(
  config: ContentEngineConfig,
  script: string,
  options: VideoGeneratorOptions = {}
): Promise<VideoGenerationResult> {
  const visualStyle = options.visualStyle || DEFAULT_VISUAL_STYLE;
  const videoPrompt = `${visualStyle} "${script}" Authentic feel, engaging delivery.`;

  return generateTextToVideo(config, {
    prompt: videoPrompt,
    aspectRatio: options.aspectRatio ?? 'portrait',
    frames: options.frames ?? '15',
    model: options.model,
  });
}

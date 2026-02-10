/**
 * Video Script Generator
 *
 * Uses AI to generate short video scripts for social media.
 */

import type { ContentEngineConfig } from '../config';
import type { VideoScriptResult } from '../types';
import { complete } from '../ai/openrouter-client';
import { buildVideoScriptPrompt } from '../ai/prompts';

/**
 * Generate a short video script using AI.
 *
 * @example
 * ```ts
 * const script = await generateVideoScript(config, {
 *   topic: '3 productivity tips for remote workers',
 *   maxWords: 45,
 *   language: 'English',
 * });
 * console.log(script.script); // ~45 words
 * ```
 */
export async function generateVideoScript(
  config: ContentEngineConfig,
  params: {
    topic: string;
    maxWords?: number;
    language?: string;
    context?: string;
    model?: string;
  }
): Promise<VideoScriptResult> {
  const prompt = buildVideoScriptPrompt({
    topic: params.topic,
    maxWords: params.maxWords,
    language: params.language,
    context: params.context,
  });

  const result = await complete(config, {
    model: params.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    maxTokens: 500,
  });

  const script = result.content.trim();
  const wordCount = script.split(/\s+/).length;
  // ~3 words per second for natural speech
  const estimatedDuration = Math.ceil(wordCount / 3);

  return {
    script,
    wordCount,
    estimatedDuration,
  };
}

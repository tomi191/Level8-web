/**
 * AI Image Generator
 *
 * Generates images via OpenRouter (Gemini Image model).
 * Converts to WebP for optimal file size.
 *
 * NOTE: Requires the `sharp` npm package for WebP conversion.
 * Install with: npm install sharp
 */

import type { ContentEngineConfig } from '../config';
import type { ImageGenerationResult } from '../types';
import { generateImageBase64 } from './openrouter-client';

export interface ImageOptions {
  /** WebP quality (1-100, default 85) */
  quality?: number;
  /** Max width in pixels */
  maxWidth?: number;
  /** Max height in pixels */
  maxHeight?: number;
}

/**
 * Generate an image from a text prompt and return as WebP buffer.
 *
 * @example
 * ```ts
 * const image = await generateImage(config, 'A serene mountain landscape at sunset', {
 *   quality: 85,
 * });
 * fs.writeFileSync('output.webp', image.buffer);
 * ```
 */
export async function generateImage(
  config: ContentEngineConfig,
  prompt: string,
  options: ImageOptions = {}
): Promise<ImageGenerationResult> {
  const log = config.logger;

  log?.info('Generating image', { promptPreview: prompt.substring(0, 80) });

  // Generate image via OpenRouter
  const { base64, mimeType } = await generateImageBase64(config, prompt);

  // Convert base64 to buffer
  const rawBuffer = Buffer.from(base64, 'base64');

  // Try to convert to WebP using sharp (optional dependency)
  try {
    const sharp = require('sharp');
    let pipeline = sharp(rawBuffer);

    if (options.maxWidth || options.maxHeight) {
      pipeline = pipeline.resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const webpBuffer: Buffer = await pipeline
      .webp({ quality: options.quality ?? 85, effort: 6 })
      .toBuffer();

    log?.info('Image generated (WebP)', { size: webpBuffer.length });

    return {
      buffer: webpBuffer,
      contentType: 'image/webp',
      size: webpBuffer.length,
    };
  } catch {
    // sharp not available — return raw image
    log?.warn('sharp not available, returning raw image');

    return {
      buffer: rawBuffer,
      contentType: mimeType,
      size: rawBuffer.length,
    };
  }
}

/**
 * Generate an image and upload it via the storage adapter.
 * Returns the public URL.
 */
export async function generateAndUploadImage(
  config: ContentEngineConfig,
  prompt: string,
  storagePath: string,
  bucket: string = 'images',
  options: ImageOptions = {}
): Promise<string> {
  if (!config.storage) {
    throw new Error('StorageAdapter not configured. Set config.storage to upload images.');
  }

  const image = await generateImage(config, prompt, options);

  const url = await config.storage.upload(
    bucket,
    storagePath,
    image.buffer,
    image.contentType
  );

  config.logger?.info('Image uploaded', { url, size: image.size });

  return url;
}

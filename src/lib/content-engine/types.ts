/**
 * Content Engine - Type Definitions
 * All shared types for the content generation module
 */

// ============ AI MODELS ============

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  costPer1M: {
    input: number;
    output: number;
  };
  maxTokens: number;
  contextWindow: number;
  strengths: string[];
}

export type ContentType = 'tofu' | 'mofu' | 'bofu' | 'advertorial';

// ============ BLOG GENERATION ============

export interface BlogGenerationParams {
  topic: string;
  keywords: string[];
  contentType: ContentType;
  category: string;
  targetWordCount: number;
  /** Optional extra context to prepend to prompt (e.g. astronomical data) */
  extraContext?: string;
}

export interface BlogGenerationResult {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  keywords: string[];
  readingTime: number;
  wordCount: number;
  suggestedSlug: string;
}

export interface BlogQualityScore {
  overall: number;
  wordCountQuality: number;
  readability: number;
  seo: number;
  warnings: string[];
}

// ============ IMAGE GENERATION ============

export interface ImageGenerationParams {
  prompt: string;
  /** Aspect ratio hint, e.g. "16:9", "1:1", "9:16" */
  aspectRatio?: string;
  /** WebP quality 1-100 */
  quality?: number;
}

export interface ImageGenerationResult {
  /** Raw image buffer (WebP) */
  buffer: Buffer;
  /** MIME type */
  contentType: string;
  /** Size in bytes */
  size: number;
}

// ============ AUDIO / TTS ============

export interface TTSParams {
  text: string;
  /** Voice identifier */
  voiceId?: string;
}

export interface TTSResult {
  /** Audio buffer (MP3) */
  buffer: Buffer;
  contentType: string;
  charCount: number;
  chunks: number;
  fileSizeKB: number;
}

export interface TTSVoice {
  id: string;
  name: string;
  description: string;
}

// ============ VIDEO GENERATION ============

export interface VideoGenerationParams {
  /** Text prompt describing the video */
  prompt: string;
  /** "portrait" | "landscape" | "square" */
  aspectRatio?: string;
  /** Number of frames (determines duration) */
  frames?: string;
  /** Model to use */
  model?: string;
}

export interface VideoGenerationResult {
  videoUrl: string;
  taskId: string;
  generationTimeSeconds: number;
}

export interface VideoScriptParams {
  topic: string;
  /** Maximum word count for the script */
  maxWords?: number;
  /** Language for the script */
  language?: string;
  /** Extra context to include in the prompt */
  context?: string;
}

export interface VideoScriptResult {
  script: string;
  wordCount: number;
  estimatedDuration: number;
}

// ============ SOCIAL MEDIA ============

export type SocialPlatform = 'youtube' | 'instagram' | 'facebook_feed' | 'facebook_story' | 'tiktok';

export interface SocialMediaMetadata {
  title: string;
  description: string;
  tags?: string[];
}

export interface UploadResult {
  platform: SocialPlatform;
  success: boolean;
  url?: string;
  postId?: string;
  error?: string;
}

export interface UploadOrchestratorResult {
  uploads: UploadResult[];
  totalTime: number;
}

// ============ COST TRACKING ============

export interface AIUsageLog {
  feature: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// ============ ADAPTERS (for decoupling from specific services) ============

export interface StorageAdapter {
  /**
   * Upload a file and return its public URL
   */
  upload(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string
  ): Promise<string>;
}

export interface DatabaseAdapter {
  insert(table: string, data: Record<string, unknown>): Promise<void>;
  update(table: string, id: string, data: Record<string, unknown>): Promise<void>;
  query(table: string, filters: Record<string, unknown>): Promise<unknown[]>;
}

export interface LogAdapter {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

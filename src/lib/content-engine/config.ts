/**
 * Content Engine - Central Configuration
 *
 * Adapt this file for your project:
 * 1. Set your API keys via environment variables
 * 2. Choose your preferred AI models
 * 3. Provide StorageAdapter and DatabaseAdapter implementations
 */

import type { AIModel, StorageAdapter, DatabaseAdapter, LogAdapter } from './types';
import type { WebSearchConfig } from './research/web-search';

// ============ AI MODEL REGISTRY ============

export const AI_MODELS: Record<string, AIModel> = {
  gemini_flash_free: {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    costPer1M: { input: 0, output: 0 },
    maxTokens: 8192,
    contextWindow: 1_048_576,
    strengths: ['fast', 'free', 'large-context'],
  },
  gemini_2_5_flash: {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    costPer1M: { input: 0.075, output: 0.30 },
    maxTokens: 8192,
    contextWindow: 1_048_576,
    strengths: ['fast', 'high-quality', 'large-context'],
  },
  gemini_3_flash: {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'Google',
    costPer1M: { input: 0.50, output: 3.0 },
    maxTokens: 65536,
    contextWindow: 1_048_576,
    strengths: ['long-form-content', 'reasoning', 'high-quality'],
  },
  gemini_image: {
    id: 'google/gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'Google',
    costPer1M: { input: 0, output: 0 },
    maxTokens: 8192,
    contextWindow: 1_048_576,
    strengths: ['image-generation', 'free'],
  },
  claude_sonnet: {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    costPer1M: { input: 3, output: 15 },
    maxTokens: 8192,
    contextWindow: 200_000,
    strengths: ['best-quality', 'empathetic', 'accurate'],
  },
  deepseek: {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek v3',
    provider: 'DeepSeek',
    costPer1M: { input: 0.27, output: 1.10 },
    maxTokens: 8192,
    contextWindow: 64_000,
    strengths: ['ultra-cheap', 'reliable'],
  },
};

// ============ CONFIGURATION ============

export interface ContentEngineConfig {
  // AI (OpenRouter)
  openrouterApiKey: string;
  /** Default model for text generation */
  defaultTextModel: string;
  /** Model for image generation */
  imageModel: string;
  /** Site URL for OpenRouter HTTP-Referer */
  siteUrl: string;
  /** Site name for OpenRouter X-Title */
  siteName: string;

  // Video (Kie.ai)
  kieApiKey: string;
  videoModel: string;

  // Audio - Google Cloud TTS
  googleCloud?: {
    clientEmail: string;
    privateKey: string;
    projectId: string;
  };

  // Audio - ElevenLabs TTS
  elevenLabs?: {
    apiKey: string;
    defaultVoiceId: string;
  };

  // Social Media - YouTube
  youtube?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };

  // Social Media - Instagram (Meta Graph API)
  instagram?: {
    accountId: string;
    accessToken: string;
  };

  // Social Media - Facebook (Meta Graph API)
  facebook?: {
    pageId: string;
    accessToken: string;
  };

  // Social Media - Viber Channel
  viber?: {
    authToken: string;
    channelId: string;
  };

  // Web Search (Tavily)
  webSearch?: WebSearchConfig;

  // Adapters
  storage?: StorageAdapter;
  database?: DatabaseAdapter;
  logger?: LogAdapter;
}

/**
 * Default configuration loaded from environment variables.
 * Override specific fields as needed.
 */
export function createDefaultConfig(): ContentEngineConfig {
  return {
    // AI
    openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
    defaultTextModel: 'google/gemini-3-flash-preview',
    imageModel: 'google/gemini-2.5-flash-image',
    siteUrl: process.env.SITE_URL || 'https://example.com',
    siteName: process.env.SITE_NAME || 'Content Engine',

    // Video
    kieApiKey: process.env.KIE_API_KEY || '',
    videoModel: 'sora-2-text-to-video',

    // Google Cloud TTS
    googleCloud: process.env.GOOGLE_CLOUD_CLIENT_EMAIL
      ? {
          clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          privateKey: (process.env.GOOGLE_CLOUD_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        }
      : undefined,

    // ElevenLabs
    elevenLabs: process.env.ELEVENLABS_API_KEY
      ? {
          apiKey: process.env.ELEVENLABS_API_KEY,
          defaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
        }
      : undefined,

    // YouTube
    youtube: process.env.YOUTUBE_CLIENT_ID
      ? {
          clientId: process.env.YOUTUBE_CLIENT_ID,
          clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
          refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || '',
        }
      : undefined,

    // Instagram
    instagram: process.env.INSTAGRAM_ACCOUNT_ID
      ? {
          accountId: process.env.INSTAGRAM_ACCOUNT_ID,
          accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
        }
      : undefined,

    // Facebook
    facebook: process.env.FACEBOOK_PAGE_ID
      ? {
          pageId: process.env.FACEBOOK_PAGE_ID,
          accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
        }
      : undefined,

    // Default console logger
    logger: {
      info: (msg, data) => console.log(`[ContentEngine] ${msg}`, data || ''),
      warn: (msg, data) => console.warn(`[ContentEngine] ${msg}`, data || ''),
      error: (msg, data) => console.error(`[ContentEngine] ${msg}`, data || ''),
    },
  };
}

// ============ HELPERS ============

/**
 * Get model config by key name
 */
export function getModelByKey(key: string): AIModel | undefined {
  return AI_MODELS[key];
}

/**
 * Get model config by model ID
 */
export function getModelById(modelId: string): AIModel | undefined {
  return Object.values(AI_MODELS).find((m) => m.id === modelId);
}

/**
 * Estimate cost in USD for a request
 */
export function estimateCost(
  modelKey: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = AI_MODELS[modelKey];
  if (!model) return 0;
  return (inputTokens / 1_000_000) * model.costPer1M.input +
         (outputTokens / 1_000_000) * model.costPer1M.output;
}

/**
 * Engine Factory — creates a ContentEngineConfig with Supabase adapters
 */

import type { ContentEngineConfig } from "./config";
import { supabaseStorage, supabaseDatabase, consoleLogger } from "./adapters";

let _config: ContentEngineConfig | null = null;

export function getContentEngine(): ContentEngineConfig {
  if (_config) return _config;

  _config = {
    // AI (OpenRouter)
    openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
    defaultTextModel: "google/gemini-3-flash-preview",
    imageModel: "google/gemini-2.5-flash-image",
    siteUrl: "https://level8.bg",
    siteName: "Level 8",

    // Video (Kie.ai)
    kieApiKey: process.env.KIE_API_KEY || "",
    videoModel: "sora-2-text-to-video",

    // Google Cloud TTS
    googleCloud: process.env.GOOGLE_CLOUD_CLIENT_EMAIL
      ? {
          clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          privateKey: (process.env.GOOGLE_CLOUD_PRIVATE_KEY || "").replace(
            /\\n/g,
            "\n"
          ),
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "",
        }
      : undefined,

    // ElevenLabs
    elevenLabs: process.env.ELEVENLABS_API_KEY
      ? {
          apiKey: process.env.ELEVENLABS_API_KEY,
          defaultVoiceId:
            process.env.ELEVENLABS_DEFAULT_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
        }
      : undefined,

    // YouTube
    youtube: process.env.YOUTUBE_CLIENT_ID
      ? {
          clientId: process.env.YOUTUBE_CLIENT_ID,
          clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
          refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || "",
        }
      : undefined,

    // Instagram
    instagram: process.env.INSTAGRAM_ACCOUNT_ID
      ? {
          accountId: process.env.INSTAGRAM_ACCOUNT_ID,
          accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "",
        }
      : undefined,

    // Facebook
    facebook: process.env.FACEBOOK_PAGE_ID
      ? {
          pageId: process.env.FACEBOOK_PAGE_ID,
          accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "",
        }
      : undefined,

    // Viber Channel
    viber: process.env.VIBER_AUTH_TOKEN
      ? {
          authToken: process.env.VIBER_AUTH_TOKEN,
          channelId: process.env.VIBER_CHANNEL_ID || "",
        }
      : undefined,

    // Web Search (Tavily)
    webSearch: process.env.TAVILY_API_KEY
      ? { apiKey: process.env.TAVILY_API_KEY }
      : undefined,

    // Supabase adapters
    storage: supabaseStorage,
    database: supabaseDatabase,
    logger: consoleLogger,
  };

  return _config;
}

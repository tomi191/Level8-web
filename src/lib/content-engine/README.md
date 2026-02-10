# Content Engine

Self-contained module for AI-powered content generation, audio/video creation, and social media distribution.

## Features

- **Blog Generation** — AI-powered article creation (TOFU, MOFU, BOFU, Advertorial)
- **Image Generation** — AI images via Gemini, auto-converted to WebP
- **Audio (TTS)** — Google Cloud TTS + ElevenLabs with chunking for long articles
- **Video Generation** — Text-to-video via Kie.ai / Sora 2
- **Social Upload** — YouTube Shorts, Instagram Reels, Facebook Feed/Stories
- **Cost Tracking** — Per-request AI cost logging

## Quick Start

```bash
# Install dependencies
npm install jose sharp  # jose for Google TTS auth, sharp for image conversion

# Set environment variables
export OPENROUTER_API_KEY="your-key"
export KIE_API_KEY="your-key"  # For video generation

# Run an example
npx tsx content-engine/examples/generate-blog-post.ts
```

## Architecture

```
content-engine/
├── config.ts                   # Central configuration + model registry
├── types.ts                    # All TypeScript types
├── ai/
│   ├── openrouter-client.ts    # OpenRouter API (text + image generation)
│   ├── prompts.ts              # Customizable prompt templates
│   ├── blog-generator.ts       # Blog pipeline: prompt → AI → parse → result
│   ├── image-generator.ts      # Image gen + WebP conversion
│   └── response-parser.ts      # Robust JSON parsing with auto-repair
├── audio/
│   ├── google-tts.ts           # Google Cloud TTS (JWT auth, chunking)
│   ├── elevenlabs-tts.ts       # ElevenLabs TTS (multilingual v2)
│   └── audio-utils.ts          # HTML strip, text chunking, buffer concat
├── video/
│   ├── kie-ai-client.ts        # Kie.ai API (Sora 2 text/image-to-video)
│   ├── script-generator.ts     # AI script generation
│   └── video-generator.ts      # Full pipeline: script → video
├── social/
│   ├── youtube.ts              # YouTube Shorts upload (OAuth2)
│   ├── instagram.ts            # Instagram Reels (Meta Graph API)
│   ├── facebook.ts             # Facebook Feed + Story upload
│   └── upload-orchestrator.ts  # Multi-platform coordination
├── utils/
│   ├── cost-tracker.ts         # AI cost logging
│   ├── slug-generator.ts       # Cyrillic→Latin slugs + word count
│   └── html-utils.ts           # HTML strip, excerpt, headings
└── examples/
    ├── generate-blog-post.ts   # Blog generation example
    ├── generate-video.ts       # Video generation example
    ├── generate-audio.ts       # TTS example
    └── upload-to-social.ts     # Social media upload example
```

## Configuration

All configuration comes from `config.ts`. Create a config object:

```typescript
import { createDefaultConfig } from './content-engine/config';

// Auto-loads from environment variables
const config = createDefaultConfig();

// Or customize:
const config = {
  openrouterApiKey: 'sk-...',
  defaultTextModel: 'google/gemini-3-flash-preview',
  imageModel: 'google/gemini-2.5-flash-image',
  siteUrl: 'https://mysite.com',
  siteName: 'My Site',
  kieApiKey: 'kie-...',
  // ... social media credentials
};
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for AI text/image |
| `KIE_API_KEY` | For video | Kie.ai API key for Sora 2 video |
| `GOOGLE_CLOUD_CLIENT_EMAIL` | For Google TTS | Service account email |
| `GOOGLE_CLOUD_PRIVATE_KEY` | For Google TTS | Service account private key |
| `GOOGLE_CLOUD_PROJECT_ID` | For Google TTS | GCP project ID |
| `ELEVENLABS_API_KEY` | For ElevenLabs | ElevenLabs API key |
| `YOUTUBE_CLIENT_ID` | For YouTube | OAuth2 client ID |
| `YOUTUBE_CLIENT_SECRET` | For YouTube | OAuth2 client secret |
| `YOUTUBE_REFRESH_TOKEN` | For YouTube | OAuth2 refresh token |
| `INSTAGRAM_ACCOUNT_ID` | For Instagram | Instagram business account ID |
| `FACEBOOK_PAGE_ID` | For Facebook | Facebook page ID |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | For IG + FB | Meta page access token |

## Adapting for Your Project

### 1. Custom Prompt Templates

Edit `ai/prompts.ts` — replace the `DEFAULT_SYSTEM_PROMPT` with your niche:

```typescript
const DEFAULT_SYSTEM_PROMPT = `You are an expert fitness copywriter...`;
```

### 2. Custom Storage (instead of local files)

Implement `StorageAdapter` in your project:

```typescript
import type { StorageAdapter } from './content-engine/types';

const supabaseStorage: StorageAdapter = {
  async upload(bucket, path, data, contentType) {
    const { data: result } = await supabase.storage
      .from(bucket)
      .upload(path, data, { contentType });
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  },
};

config.storage = supabaseStorage;
```

### 3. Custom Database Logging

Implement `DatabaseAdapter`:

```typescript
import type { DatabaseAdapter } from './content-engine/types';

const postgresDB: DatabaseAdapter = {
  async insert(table, data) {
    await pool.query(`INSERT INTO ${table} ...`, data);
  },
  async update(table, id, data) { /* ... */ },
  async query(table, filters) { /* ... */ },
};

config.database = postgresDB;
```

### 4. Add Custom Voices (TTS)

Edit `audio/google-tts.ts` or `audio/elevenlabs-tts.ts`:

```typescript
// In google-tts.ts
GOOGLE_VOICES['es-ES-female'] = {
  id: 'es-ES-Neural2-A',
  name: 'Spanish Female',
  description: 'Spanish neural female voice',
  languageCode: 'es-ES',
  ssmlGender: 'FEMALE',
};

// In elevenlabs-tts.ts
ELEVENLABS_VOICES['my-custom'] = {
  id: 'your-voice-id',
  name: 'My Custom Voice',
  description: 'Custom trained voice',
};
```

### 5. Add New AI Models

Edit `config.ts`:

```typescript
AI_MODELS['gpt4o'] = {
  id: 'openai/gpt-4o',
  name: 'GPT-4o',
  provider: 'OpenAI',
  costPer1M: { input: 5, output: 15 },
  maxTokens: 16384,
  contextWindow: 128_000,
  strengths: ['multimodal', 'reliable'],
};
```

## API Reference

### Blog Generation

```typescript
import { generateBlogPost } from './content-engine/ai/blog-generator';

const post = await generateBlogPost(config, {
  topic: 'Your topic',
  keywords: ['keyword1', 'keyword2'],
  contentType: 'tofu',      // tofu | mofu | bofu | advertorial
  category: 'your-category',
  targetWordCount: 2000,
});
// Returns: { title, content, metaTitle, metaDescription, excerpt, keywords, wordCount, readingTime, suggestedSlug }
```

### Image Generation

```typescript
import { generateImage } from './content-engine/ai/image-generator';

const image = await generateImage(config, 'A sunset over mountains', { quality: 85 });
fs.writeFileSync('image.webp', image.buffer);
```

### Video Generation

```typescript
import { generateFullVideo } from './content-engine/video/video-generator';

const { script, video } = await generateFullVideo(config, 'Your topic', {
  language: 'English',
  visualStyle: 'Person speaking to camera in studio',
});
```

### Audio (TTS)

```typescript
import { generateGoogleTTS } from './content-engine/audio/google-tts';

const audio = await generateGoogleTTS(config, '<p>Your HTML content</p>', 'en-US-female');
fs.writeFileSync('audio.mp3', audio.buffer);
```

### Social Upload

```typescript
import { uploadToAll } from './content-engine/social/upload-orchestrator';

const result = await uploadToAll(config, videoUrl, {
  title: 'My Video',
  description: 'Description #hashtag',
  tags: ['tag1', 'tag2'],
});
```

## Dependencies

| Package | Required For | Install |
|---------|-------------|---------|
| `jose` | Google Cloud TTS (JWT auth) | `npm install jose` |
| `sharp` | Image WebP conversion | `npm install sharp` |

Both are optional — the module degrades gracefully without them.

## Cost Optimization

Models are listed in `config.ts` with per-token pricing. Use free models where possible:

| Model | Cost | Best For |
|-------|------|----------|
| Gemini 2.0 Flash (Free) | $0 | Daily content, short texts |
| Gemini 2.5 Flash Image | $0 | Image generation |
| Gemini 3 Flash Preview | $0.50/$3.0 per 1M | Long-form blog posts |
| DeepSeek v3 | $0.27/$1.10 per 1M | Budget fallback |
| Claude 3.5 Sonnet | $3/$15 per 1M | Premium quality |

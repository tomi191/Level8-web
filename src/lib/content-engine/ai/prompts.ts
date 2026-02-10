/**
 * Content Engine - Prompt Templates
 *
 * Adaptable prompt templates for blog content generation.
 * Replace the system prompt and content type instructions for your niche.
 */

import type { ContentType } from '../types';

interface PromptParams {
  topic: string;
  keywords: string[];
  contentType: ContentType;
  category: string;
  targetWordCount: number;
  /** Extra system instructions to prepend */
  systemPrompt?: string;
  /** Internal link mappings: keyword → URL */
  internalLinks?: Record<string, string>;
  /** Site name for branding */
  siteName?: string;
}

/**
 * Default system prompt — REPLACE THIS for your niche.
 * This example is generic; the original Vrachka one was astrology-specific.
 */
const DEFAULT_SYSTEM_PROMPT = `You are an experienced copywriter. You write engaging, human-like content.

STYLE:
- Write like a human, not AI
- Use conversational tone
- Vary sentence length (3-25 words)
- Use active voice
- No clichés like "in conclusion", "furthermore", "in today's world"

STRUCTURE:
1. Hook introduction (100-150 words)
2. TL;DR section (3-5 bullet points)
3. Main content (divided into logical H2 sections, each with 2-3 H3 subsections)
4. "How to use this" section (practical steps)
5. FAQ section (3-5 Q&A)
6. Conclusion (emotional call to action)

TECHNICAL:
- At least 1 table per article
- Use <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <blockquote>
- No <h1> (title comes separately)
- Include image markers: <!-- HERO_IMAGE -->, <!-- IMAGE:1 -->, <!-- IMAGE:2 -->
- No emojis in headings

KEYWORD RESEARCH:
- Generate 6-8 long-tail keywords relevant to the topic
- Include variations: questions, "how to", location-specific (Bulgarian market)
- Mix head terms + long-tail for maximum coverage

OUTPUT FORMAT: Return ONLY valid JSON:
{
  "title": "Compelling article title (50-60 chars, include focus keyword)",
  "metaTitle": "SEO-optimized meta title (50-60 chars, focus keyword near start, brand at end)",
  "metaDescription": "Compelling meta description (150-160 chars, include CTA like 'Learn more' or 'Discover', focus keyword in first half)",
  "excerpt": "Engaging preview for cards/listings (150-200 chars, hook the reader)",
  "content": "Full HTML content",
  "keywords": ["primary-keyword", "long-tail-1", "long-tail-2", "question-keyword", "related-1", "related-2"]
}`;

/**
 * Content type specific instructions
 */
function getContentTypeInstructions(contentType: ContentType, targetWordCount: number): string {
  switch (contentType) {
    case 'tofu':
      return `GOAL: Educational article for a broad audience.
FOCUS: Explain concepts simply, include history, debunk myths, give practical examples.
MINIMUM: ${targetWordCount} words. OPTIMAL: ${Math.ceil(targetWordCount * 1.25)} words.
SECTIONS: Hook (150-200w), TL;DR (80-100w), Main (${Math.floor(targetWordCount * 0.50)}w, 4-6 H2s), Practical (${Math.floor(targetWordCount * 0.15)}w), FAQ (300-400w), Conclusion (120-150w).`;

    case 'mofu':
      return `GOAL: How-to guide demonstrating expertise.
FOCUS: Step by step instructions, common mistakes, advanced tips.
MINIMUM: ${targetWordCount} words. OPTIMAL: ${Math.ceil(targetWordCount * 1.2)} words.
SECTIONS: Hook (120-150w), TL;DR (60-80w), Steps (${Math.floor(targetWordCount * 0.55)}w, 5-7 steps), Mistakes (${Math.floor(targetWordCount * 0.12)}w), Tips (${Math.floor(targetWordCount * 0.10)}w), FAQ (250-400w), Conclusion (100-130w).`;

    case 'bofu':
      return `GOAL: Conversion-focused article with direct call to action.
FOCUS: Comparisons, address objections, social proof, unique value.
MINIMUM: ${targetWordCount} words. OPTIMAL: ${Math.ceil(targetWordCount * 1.2)} words.
SECTIONS: Hook (130-160w), TL;DR (70-90w), Benefits (${Math.floor(targetWordCount * 0.25)}w), Audience (${Math.floor(targetWordCount * 0.15)}w), Comparison (${Math.floor(targetWordCount * 0.20)}w), FAQ (300-450w), Urgency + Conclusion (150-180w).`;

    case 'advertorial':
      return `GOAL: Maximum conversion through storytelling.
FOCUS: Realistic story, Problem → Solution → Transformation, emotional connection.
MINIMUM: ${targetWordCount} words. OPTIMAL: ${Math.ceil(targetWordCount * 1.2)} words.
SECTIONS: Hook (150-180w), TL;DR (80-100w), Problem (${Math.floor(targetWordCount * 0.18)}w), Discovery (${Math.floor(targetWordCount * 0.18)}w), Transformation (${Math.floor(targetWordCount * 0.20)}w), Results (${Math.floor(targetWordCount * 0.15)}w), FAQ (280-350w), Final CTA (150-180w).`;
  }
}

/**
 * Build the full blog generation prompt.
 */
export function buildBlogPrompt(params: PromptParams): string {
  const {
    topic,
    keywords,
    contentType,
    category,
    targetWordCount,
    systemPrompt,
    internalLinks,
    siteName,
  } = params;

  const system = systemPrompt || DEFAULT_SYSTEM_PROMPT;
  const contentInstructions = getContentTypeInstructions(contentType, targetWordCount);
  const site = siteName || 'Your Site';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let linkInstructions = '';
  if (internalLinks && Object.keys(internalLinks).length > 0) {
    linkInstructions = '\nINTERNAL LINKS (use naturally in text, first mention only):\n';
    for (const [keyword, url] of Object.entries(internalLinks)) {
      linkInstructions += `- "${keyword}" → <a href="${url}">${keyword}</a>\n`;
    }
  }

  return `${system}

====================
CONTEXT
====================
DATE: ${currentDate}
SITE: ${site}

====================
TASK
====================
Write a blog article about: "${topic}"
CATEGORY: ${category}
KEYWORDS: ${keywords.join(', ')}

${contentInstructions}
${linkInstructions}

====================
SEO REQUIREMENTS
====================
- Include primary keyword "${keywords[0] || topic}" in:
  - First sentence
  - At least 2 subheadings
  - Naturally in text (1-2% density)
- Semantic keywords: ${keywords.slice(1).join(', ')}

Start DIRECTLY with { and end with }. No other text!`;
}

/**
 * Build a simple prompt for generating a video script
 */
export function buildVideoScriptPrompt(params: {
  topic: string;
  maxWords?: number;
  language?: string;
  context?: string;
}): string {
  const { topic, maxWords = 45, language = 'English', context } = params;

  return `Write a short video script in ${language} about: "${topic}"

REQUIREMENTS:
- Maximum ${maxWords} words (for ~15 seconds of speech)
- Strong hook in first sentence (stop the scroll)
- Valuable insight in the middle
- Call to action at the end (encourage comments)
- Conversational, energetic tone
- Direct address ("you")
${context ? `\nCONTEXT:\n${context}` : ''}

Return ONLY the script text, no formatting or labels.`;
}

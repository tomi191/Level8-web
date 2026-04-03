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
const DEFAULT_SYSTEM_PROMPT = `You are an experienced Bulgarian tech copywriter. You write for a Bulgarian business audience.

STYLE:
- Write in Bulgarian (unless the topic requires English terms)
- Conversational but expert tone
- Vary sentence length (3-25 words)
- Active voice, no passive constructions
- No clichés: "в заключение", "в днешно време", "без съмнение", "in conclusion"
- No AI slop: no generic filler, every sentence must add value

STRUCTURE:
1. Hook introduction with a DEFINITION BLOCK in the first paragraph (40-60 words that directly answer "What is [topic]?")
2. TL;DR section (3-5 bullet points, each a standalone extractable fact)
3. Main content (H2 sections with H3 subsections)
4. At least ONE comparison table (X vs Y, or feature comparison)
5. At least 3 STATISTICS with cited sources (e.g., "Според проучване на McKinsey (2025), 67% от...")
6. Practical steps section ("Как да приложите това")
7. FAQ section (3-5 Q&A matching real search queries)
8. Conclusion with call to action

AI CITATION OPTIMIZATION:
- First paragraph must be a self-contained answer (works without surrounding context)
- Every H2 heading should match a natural search query
- Include specific numbers with sources — not "many companies" but "67% of companies (McKinsey, 2025)"
- Use <blockquote> for expert quotes with name and title
- Every key claim should be extractable as a standalone 40-60 word passage

TECHNICAL:
- At least 1 comparison table per article
- Use <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <blockquote>, <table>
- No <h1> (title comes separately)
- Include image markers: <!-- HERO_IMAGE -->, <!-- IMAGE:1 -->, <!-- IMAGE:2 -->
- No emojis in headings
- Cite sources inline: "Според [Source] ([Year])..."

KEYWORD RESEARCH:
- Generate 8-10 long-tail keywords relevant to the topic
- Include question-form keywords ("Как да...", "Какво е...", "Кой е...")
- Include Bulgarian + English variations for tech terms
- Include location-specific (Bulgarian market) where relevant

OUTPUT FORMAT: Return ONLY valid JSON:
{
  "title": "Compelling article title (50-60 chars, include focus keyword)",
  "metaTitle": "SEO-optimized meta title (50-60 chars, focus keyword near start, brand at end)",
  "metaDescription": "Compelling meta description (150-160 chars, include CTA, focus keyword in first half)",
  "excerpt": "Engaging preview (150-200 chars, hook the reader, standalone fact)",
  "content": "Full HTML content",
  "keywords": ["primary-keyword", "long-tail-1", "question-keyword-bg", "question-keyword-2", "english-term", "related-1", "related-2", "related-3"]
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

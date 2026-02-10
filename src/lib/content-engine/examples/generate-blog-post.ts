/**
 * Example: Generate a Blog Post
 *
 * Usage: npx tsx content-engine/examples/generate-blog-post.ts
 *
 * Requires: OPENROUTER_API_KEY in .env or environment
 */

import { createDefaultConfig } from '../config';
import { generateBlogPost } from '../ai/blog-generator';

async function main() {
  // Load config from environment variables
  const config = createDefaultConfig();

  if (!config.openrouterApiKey) {
    console.error('Missing OPENROUTER_API_KEY');
    process.exit(1);
  }

  console.log('Generating blog post...\n');

  const result = await generateBlogPost(config, {
    topic: 'How to Start a Successful Blog in 2026',
    keywords: ['start a blog', 'blogging tips', 'content creation', 'SEO basics'],
    contentType: 'tofu',
    category: 'marketing',
    targetWordCount: 2000,
  });

  console.log('=== RESULT ===\n');
  console.log(`Title: ${result.title}`);
  console.log(`Slug: ${result.suggestedSlug}`);
  console.log(`Words: ${result.wordCount}`);
  console.log(`Reading time: ${result.readingTime} min`);
  console.log(`Meta title: ${result.metaTitle}`);
  console.log(`Meta desc: ${result.metaDescription}`);
  console.log(`Keywords: ${result.keywords.join(', ')}`);
  console.log(`\nContent preview:\n${result.content.substring(0, 500)}...`);
}

main().catch(console.error);

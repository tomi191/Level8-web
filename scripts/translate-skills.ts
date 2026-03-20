#!/usr/bin/env npx tsx
/**
 * Translate skill descriptions from English to Bulgarian
 *
 * Reads github-skills.json, translates descriptions via OpenRouter,
 * writes back to the same file.
 *
 * Usage: OPENROUTER_API_KEY=sk-or-xxx npx tsx scripts/translate-skills.ts
 */

import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, "../src/data/github-skills.json");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BATCH_SIZE = 30;
const DELAY_MS = 2000;

interface Skill {
  id: string;
  description: string;
  descriptionEn: string;
  [key: string]: unknown;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateBatch(descriptions: { id: string; text: string }[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (descriptions.length === 0) return result;

  const numbered = descriptions.map((d, i) => `${i + 1}. [${d.id}] ${d.text}`).join("\n");

  const prompt = `Преведи следните описания на AI agent skills от английски на български.
Запази техническите термини (API, CSS, Docker, React, SQL, Git, CI/CD, Kubernetes, TypeScript, MCP и т.н.) непреведени.
Преводът трябва да е кратък, ясен и естествен за българска IT аудитория.
Върни САМО JSON обект с формат: {"skill-id": "превод на български", ...}
НЕ добавяй допълнителен текст, коментари или markdown — само чист JSON.

Описания:
${numbered}`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://level8.bg",
        "X-Title": "Level 8 Skills Translator",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`  [WARN] ${res.status}: ${text.slice(0, 100)}`);
      return result;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const translations = JSON.parse(jsonMatch[0]);
      for (const [id, translation] of Object.entries(translations)) {
        if (typeof translation === "string" && translation.trim()) {
          result.set(id, translation.trim().slice(0, 300));
        }
      }
    }
  } catch (err) {
    console.warn(`  [WARN] ${err}`);
  }

  return result;
}

async function main() {
  if (!OPENROUTER_API_KEY) {
    console.error("Error: OPENROUTER_API_KEY is required.");
    process.exit(1);
  }

  console.log("=== Skills Description Translator ===\n");

  const skills: Skill[] = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  console.log(`Loaded ${skills.length} skills from ${DATA_PATH}\n`);

  // Find skills needing translation
  const needsTranslation = skills.filter((s) => s.description === s.descriptionEn);
  const alreadyTranslated = skills.length - needsTranslation.length;
  console.log(`Already translated: ${alreadyTranslated}`);
  console.log(`Needs translation: ${needsTranslation.length}\n`);

  if (needsTranslation.length === 0) {
    console.log("Nothing to translate!");
    return;
  }

  let translated = 0;
  let failed = 0;

  for (let i = 0; i < needsTranslation.length; i += BATCH_SIZE) {
    const batch = needsTranslation.slice(i, i + BATCH_SIZE);
    const descriptions = batch.map((s) => ({ id: s.id, text: s.descriptionEn }));

    const translations = await translateBatch(descriptions);

    for (const skill of batch) {
      const bg = translations.get(skill.id);
      if (bg) {
        skill.description = bg;
        translated++;
      } else {
        failed++;
      }
    }

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(needsTranslation.length / BATCH_SIZE);
    console.log(`  Batch ${batchNum}/${totalBatches}: ${translations.size}/${batch.length} translated`);

    // Save progress every 10 batches
    if (batchNum % 10 === 0) {
      writeFileSync(DATA_PATH, JSON.stringify(skills, null, 2));
      console.log(`  [SAVED] Progress saved (${translated} translations so far)`);
    }

    await delay(DELAY_MS);
  }

  // Final save
  writeFileSync(DATA_PATH, JSON.stringify(skills, null, 2));

  console.log(`\n=== Done! ===`);
  console.log(`Translated: ${translated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total with BG: ${alreadyTranslated + translated}/${skills.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

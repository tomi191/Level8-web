#!/usr/bin/env npx tsx
/**
 * GitHub SKILL.md Discovery Script v2
 *
 * Fetches SKILL.md files from:
 * 1. Curated seed repos (known high-quality sources)
 * 2. GitHub Code Search API (broader discovery)
 * 3. GitHub Repository Search by topics
 * 4. Optional: Translate descriptions to Bulgarian via OpenRouter
 *
 * Outputs: src/data/github-skills.json
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx pnpm sync-skills
 *   GITHUB_TOKEN=ghp_xxx OPENROUTER_API_KEY=sk-or-xxx pnpm sync-skills
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

/* ── Configuration ─────────────────────────── */

const SEED_REPOS = [
  // ── Official / high-stars ──
  "anthropics/skills",
  "microsoft/skills",
  "agentskills/agentskills",

  // ── Collections with many SKILL.md files ──
  "VoltAgent/awesome-agent-skills",
  "VoltAgent/awesome-openclaw-skills",
  "travisvn/awesome-claude-skills",
  "ComposioHQ/awesome-claude-skills",
  "heilcheng/awesome-agent-skills",
  "skillmatic-ai/awesome-agent-skills",

  // ── Skill authors ──
  "wshobson/agents",
  "obra/superpowers",
  "vercel-labs/agent-skills",
  "vercel-labs/next-skills",
  "antfu/skills",
  "trailofbits/skills",
  "K-Dense-AI/claude-scientific-skills",
  "google-labs-code/stitch-skills",
  "coreyhaines31/marketingskills",

  // ── Specialized collections ──
  "alirezarezvani/claude-skills",
  "abubakarsiddik31/claude-skills-collection",
  "levnikolaevich/claude-code-skills",
  "muratcankoylan/Agent-Skills-for-Context-Engineering",
  "BankrBot/openclaw-skills",
  "sundial-org/awesome-openclaw-skills",

  // ── OpenClaw registry ──
  "openclaw/skills",
  "openclaw/openclaw",
];

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../src/data/github-skills.json");
const MIN_STARS = 2;
const DELAY_MS = 150;
const MAX_SKILLS_PER_REPO = 250; // Cap per repo to keep sync under 10 minutes

/* ── Types ─────────────────────────────────── */

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
}

interface DiscoveredSkill {
  id: string;
  name: string;
  description: string;
  descriptionEn: string;
  category: string;
  author: string;
  repo: string;
  stars: number;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  platform: string[];
  skillMdUrl: string;
  updatedAt: string;
  source: "github";
}

/* ── Helpers ───────────────────────────────── */

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Cache repo metadata to avoid duplicate API calls
const repoCache = new Map<string, { stars: number; branch: string; pushedAt: string } | null>();

async function githubFetch(url: string, headers: Record<string, string>, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await delay(DELAY_MS);
    try {
      const res = await fetch(url, { headers });
      if (res.status === 403) {
        // Rate limited — wait and retry
        const resetAt = res.headers.get("x-ratelimit-reset");
        const waitMs = resetAt ? Math.max(0, Number(resetAt) * 1000 - Date.now()) + 1000 : 60000;
        console.warn(`  [RATE LIMIT] Waiting ${Math.ceil(waitMs / 1000)}s...`);
        await delay(Math.min(waitMs, 120000));
        continue;
      }
      if (!res.ok) {
        if (attempt < retries && res.status >= 500) {
          await delay(2000 * (attempt + 1));
          continue;
        }
        const text = await res.text().catch(() => "");
        console.warn(`  [WARN] ${res.status} for ${url.slice(0, 80)}: ${text.slice(0, 80)}`);
        return null;
      }
      return res.json();
    } catch (err) {
      if (attempt < retries) {
        await delay(2000 * (attempt + 1));
        continue;
      }
      console.warn(`  [WARN] Fetch failed: ${err}`);
      return null;
    }
  }
  return null;
}

async function getRepoInfo(repoName: string, headers: Record<string, string>) {
  if (repoCache.has(repoName)) return repoCache.get(repoName);
  const data = await githubFetch(`https://api.github.com/repos/${repoName}`, headers);
  if (!data) {
    repoCache.set(repoName, null);
    return null;
  }
  const info = {
    stars: data.stargazers_count ?? 0,
    branch: data.default_branch || "main",
    pushedAt: data.pushed_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  };
  repoCache.set(repoName, info);
  return info;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Keyword → category mapping. Order matters: more specific first. */
const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/\b(secur|vulnerab|cve|owasp|pentest|threat|exploit|crypto(?!currency)|encrypt|xss|csrf|injection|auth(?:entication|orization)|rbac|oauth)\b/i, "security"],
  [/\b(test|tdd|bdd|jest|vitest|playwright|cypress|pytest|unittest|spec|e2e|integration.test|snapshot|mock|stub|fixture|assert)\b/i, "testing"],
  [/\b(databas|sql|postgres|mysql|mongo|redis|supabase|prisma|drizzle|migration|schema|query|orm|nosql|sqlite|dynamodb|firestore)\b/i, "database"],
  [/\b(devops|docker|kubernetes|k8s|ci.?cd|pipeline|deploy|terraform|ansible|aws|gcp|azure|nginx|linux|server|infra|monitor|helm|github.?action|cloudflare)\b/i, "devops"],
  [/\b(ai\b|machine.?learn|deep.?learn|neural|llm|gpt|claude|openai|langchain|vector|embed|rag|prompt|fine.?tun|model|train|nlp|computer.?vision|scienti|research|analy|statistic|data.?science|pandas|numpy|tensor|pytorch)\b/i, "data-ai"],
  [/\b(design|figma|sketch|ui\b|ux\b|css|style|tailwind|sass|animation|layout|responsive|accessibility|a11y|color|typograph|visual|wireframe|mockup|prototype)\b/i, "design"],
  [/\b(document|readme|changelog|jsdoc|tsdoc|typedoc|api.?doc|comment|licens|contribut|guide|tutorial|wiki|markdown|technical.?writ)\b/i, "documentation"],
  [/\b(market|seo|advertis|campaign|brand|social.?media|content.?strateg|copywriting|email.?market|analytics|conversion|funnel|landing.?page)\b/i, "marketing"],
  [/\b(react|next\.?js|vue|angular|svelte|typescript|javascript|python|rust|go\b|java\b|swift|kotlin|ruby|php|node\.?js|api|rest|graphql|websocket|component|hook|state|route|middleware|compiler|bundl|webpack|vite|eslint|lint|refactor|debug|performance|optimi|code.?review|architect|pattern|solid|clean.?code)\b/i, "development"],
];

function mapCategory(input?: string | string[]): string {
  if (input) {
    const items = Array.isArray(input) ? input : [input];
    const text = items.join(" ").toLowerCase();
    for (const [re, cat] of CATEGORY_KEYWORDS) {
      if (re.test(text)) return cat;
    }
  }
  return "tools";
}

function inferCategory(name: string, description: string, fmCategory?: string | string[], fmTags?: string[]): string {
  if (fmCategory) {
    const result = mapCategory(fmCategory);
    if (result !== "tools") return result;
  }
  if (fmTags?.length) {
    const result = mapCategory(fmTags);
    if (result !== "tools") return result;
  }
  const combined = `${name} ${description}`;
  for (const [re, cat] of CATEGORY_KEYWORDS) {
    if (re.test(combined)) return cat;
  }
  return "tools";
}

function inferDifficulty(content: string): "beginner" | "intermediate" | "advanced" {
  const len = content.length;
  if (len > 5000) return "advanced";
  if (len > 2000) return "intermediate";
  return "beginner";
}

function parseSkillMd(mdText: string, filePath: string, repoName: string, stars: number, branch: string, pushedAt: string, seenIds: Set<string>): DiscoveredSkill | null {
  const { data: fm, content } = matter(mdText);

  // Must have at least a name or description, or be in a named folder
  if (!fm.name && !fm.description) {
    const pathParts = filePath.split("/");
    if (pathParts.length < 2) return null;
  }

  const pathName = filePath.split("/").slice(-2, -1)[0] || "";
  const skillId = slugify(fm.name || pathName || filePath.replace(/\/SKILL\.md$/, ""));
  if (!skillId || seenIds.has(skillId)) return null;

  const description = (
    fm.description ||
    content.split("\n").find((l: string) => l.trim() && !l.startsWith("#")) ||
    ""
  ).toString().trim().slice(0, 300);

  if (!description) return null;

  return {
    id: skillId,
    name: fm.name || skillId,
    description,
    descriptionEn: description,
    category: inferCategory(fm.name || skillId, description, fm.category, Array.isArray(fm.tags) ? fm.tags : undefined),
    author: repoName.split("/")[0],
    repo: `https://github.com/${repoName}`,
    stars,
    tags: Array.isArray(fm.tags) ? fm.tags.slice(0, 5).map(String) : [],
    difficulty: inferDifficulty(content),
    platform: ["claude"],
    skillMdUrl: `https://raw.githubusercontent.com/${repoName}/${branch}/${filePath}`,
    updatedAt: pushedAt,
    source: "github",
  };
}

/* ── Translation ──────────────────────────── */

async function translateBatch(descriptions: { id: string; text: string }[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!OPENROUTER_API_KEY || descriptions.length === 0) return result;

  // Build a numbered list for batch translation
  const numbered = descriptions.map((d, i) => `${i + 1}. [${d.id}] ${d.text}`).join("\n");

  const prompt = `Преведи следните описания на AI agent skills от английски на български език.
Запази техническите термини (напр. API, CSS, Docker, React, SQL, Git, CI/CD) непреведени.
Преводът трябва да е кратък, естествен и подходящ за българска аудитория.
Върни САМО JSON обект с формат: {"id": "превод", ...}

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
      console.warn(`  [TRANSLATE WARN] ${res.status}: ${await res.text().catch(() => "")}`);
      return result;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
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
    console.warn(`  [TRANSLATE WARN] ${err}`);
  }

  return result;
}

/* ── Main Pipeline ─────────────────────────── */

async function main() {
  if (!GITHUB_TOKEN) {
    console.error("Error: GITHUB_TOKEN environment variable is required.");
    console.error("Usage: GITHUB_TOKEN=ghp_xxx npx tsx scripts/sync-skills.ts");
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const allSkills: DiscoveredSkill[] = [];
  const seenIds = new Set<string>();
  // Track repos already processed to avoid duplicate tree fetches
  const processedRepos = new Set<string>();

  console.log("=== GitHub SKILL.md Discovery v2 ===\n");
  if (OPENROUTER_API_KEY) {
    console.log("Bulgarian translation: ENABLED (OpenRouter)\n");
  } else {
    console.log("Bulgarian translation: DISABLED (set OPENROUTER_API_KEY to enable)\n");
  }

  /* ── Phase 1: Seed repos ── */
  console.log("Phase 1: Fetching from seed repos...\n");

  for (const repoFullName of SEED_REPOS) {
    if (processedRepos.has(repoFullName)) continue;
    processedRepos.add(repoFullName);
    console.log(`  [REPO] ${repoFullName}`);

    try {
      const repoInfo = await getRepoInfo(repoFullName, headers);
      if (!repoInfo) {
        console.log(`    Skipped (not found)`);
        continue;
      }
      if (repoInfo.stars < MIN_STARS) {
        console.log(`    Skipped (${repoInfo.stars} stars < ${MIN_STARS})`);
        continue;
      }

      const treeData = await githubFetch(
        `https://api.github.com/repos/${repoFullName}/git/trees/${repoInfo.branch}?recursive=1`,
        headers
      );
      if (!treeData?.tree) {
        console.log(`    Skipped (no tree)`);
        continue;
      }

      // Find all SKILL.md files
      const allSkillFiles = (treeData.tree as GitHubTreeItem[]).filter(
        (item) => item.type === "blob" && (item.path.endsWith("/SKILL.md") || item.path === "SKILL.md")
      );

      // Cap to MAX_SKILLS_PER_REPO (take first N, which are typically alphabetical)
      const skillFiles = allSkillFiles.slice(0, MAX_SKILLS_PER_REPO);
      const skippedCount = allSkillFiles.length - skillFiles.length;
      console.log(`    Found ${allSkillFiles.length} SKILL.md files (${repoInfo.stars.toLocaleString()} stars)${skippedCount > 0 ? ` — capped to ${MAX_SKILLS_PER_REPO}` : ""}`);

      for (const file of skillFiles) {
        try {
          await delay(80);
          const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/${repoInfo.branch}/${file.path}`;
          const mdRes = await fetch(rawUrl);
          if (!mdRes.ok) continue;
          const mdText = await mdRes.text();

          const skill = parseSkillMd(mdText, file.path, repoFullName, repoInfo.stars, repoInfo.branch, repoInfo.pushedAt, seenIds);
          if (skill) {
            seenIds.add(skill.id);
            allSkills.push(skill);
          }
        } catch {
          // Skip individual file failures
        }
      }
    } catch (err) {
      console.error(`    Error: ${err}`);
    }
  }

  console.log(`\nPhase 1 complete: ${allSkills.length} skills from ${processedRepos.size} seed repos.\n`);

  /* ── Phase 2: GitHub Code Search ── */
  console.log("Phase 2: GitHub Code Search for broader discovery...\n");

  const searchQueries = [
    "filename:SKILL.md path:skills language:markdown",
    "filename:SKILL.md path:.claude/skills language:markdown",
    "filename:SKILL.md path:extensions language:markdown",
    "filename:SKILL.md path:agents language:markdown",
    "filename:SKILL.md description language:markdown stars:>5",
    "filename:SKILL.md name language:markdown stars:>10",
  ];

  for (const q of searchQueries) {
    console.log(`  [SEARCH] ${q}`);

    try {
      for (let page = 1; page <= 5; page++) {
        const searchData = await githubFetch(
          `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=100&page=${page}`,
          headers
        );

        if (!searchData?.items?.length) break;
        console.log(`    Page ${page}: ${searchData.items.length} results`);

        // Group items by repo
        const repoItems = new Map<string, Array<{ path: string }>>();
        for (const item of searchData.items) {
          const fullName = item.repository?.full_name;
          if (!fullName || processedRepos.has(fullName)) continue;
          if (!repoItems.has(fullName)) repoItems.set(fullName, []);
          repoItems.get(fullName)!.push({ path: item.path });
        }

        for (const [repoName, items] of repoItems) {
          const repoInfo = await getRepoInfo(repoName, headers);
          if (!repoInfo || repoInfo.stars < MIN_STARS) continue;

          // Mark as processed so we don't fetch tree again in Phase 3
          processedRepos.add(repoName);

          for (const item of items) {
            const pathName = item.path.split("/").slice(-2, -1)[0] || "";
            const skillId = slugify(pathName || item.path.replace(/\/SKILL\.md$/, ""));
            if (!skillId || seenIds.has(skillId)) continue;

            try {
              await delay(80);
              const rawUrl = `https://raw.githubusercontent.com/${repoName}/${repoInfo.branch}/${item.path}`;
              const mdRes = await fetch(rawUrl);
              if (!mdRes.ok) continue;
              const mdText = await mdRes.text();

              const skill = parseSkillMd(mdText, item.path, repoName, repoInfo.stars, repoInfo.branch, repoInfo.pushedAt, seenIds);
              if (skill) {
                seenIds.add(skill.id);
                allSkills.push(skill);
              }
            } catch {
              // Skip
            }
          }
        }

        // Rate limit: wait between search pages
        await delay(3000);
      }
    } catch (err) {
      console.warn(`  [WARN] Search failed: ${err}`);
    }
  }

  console.log(`\nPhase 2 complete: ${allSkills.length} total skills.\n`);

  /* ── Phase 3: Repository Search by topics ── */
  console.log("Phase 3: Discovering repos by topics...\n");

  const topicQueries = [
    "topic:agent-skills",
    "topic:claude-skills",
    "topic:ai-skills SKILL.md",
    "agent skills SKILL.md in:readme",
    "claude code skills in:readme stars:>5",
  ];

  for (const q of topicQueries) {
    console.log(`  [REPO SEARCH] ${q}`);

    try {
      for (let page = 1; page <= 3; page++) {
        const searchData = await githubFetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=30&page=${page}`,
          headers
        );

        if (!searchData?.items?.length) break;
        console.log(`    Page ${page}: ${searchData.items.length} repos`);

        for (const repo of searchData.items) {
          const repoName = repo.full_name;
          if (processedRepos.has(repoName)) continue;
          processedRepos.add(repoName);

          const stars = repo.stargazers_count ?? 0;
          if (stars < MIN_STARS) continue;

          // Fetch tree to find SKILL.md files
          const branch = repo.default_branch || "main";
          const treeData = await githubFetch(
            `https://api.github.com/repos/${repoName}/git/trees/${branch}?recursive=1`,
            headers
          );
          if (!treeData?.tree) continue;

          const allRepoSkills = (treeData.tree as GitHubTreeItem[]).filter(
            (item) => item.type === "blob" && (item.path.endsWith("/SKILL.md") || item.path === "SKILL.md")
          );

          if (allRepoSkills.length === 0) continue;
          const skillFiles = allRepoSkills.slice(0, MAX_SKILLS_PER_REPO);
          console.log(`    ${repoName}: ${allRepoSkills.length} SKILL.md (${stars.toLocaleString()} stars)${allRepoSkills.length > MAX_SKILLS_PER_REPO ? ` — capped to ${MAX_SKILLS_PER_REPO}` : ""}`);

          // Cache repo info
          repoCache.set(repoName, { stars, branch, pushedAt: repo.pushed_at?.slice(0, 10) || new Date().toISOString().slice(0, 10) });

          for (const file of skillFiles) {
            try {
              await delay(80);
              const rawUrl = `https://raw.githubusercontent.com/${repoName}/${branch}/${file.path}`;
              const mdRes = await fetch(rawUrl);
              if (!mdRes.ok) continue;
              const mdText = await mdRes.text();

              const skill = parseSkillMd(mdText, file.path, repoName, stars, branch, repo.pushed_at?.slice(0, 10) || "", seenIds);
              if (skill) {
                seenIds.add(skill.id);
                allSkills.push(skill);
              }
            } catch {
              // Skip
            }
          }
        }

        await delay(3000);
      }
    } catch (err) {
      console.warn(`  [WARN] Repo search failed: ${err}`);
    }
  }

  console.log(`\nPhase 3 complete: ${allSkills.length} total skills from ${processedRepos.size} repos.\n`);

  /* ── Phase 4: Final dedup + sort ── */
  const finalIds = new Set<string>();
  const deduped = allSkills.filter((s) => {
    if (finalIds.has(s.id)) return false;
    finalIds.add(s.id);
    return true;
  });

  deduped.sort((a, b) => b.stars - a.stars);

  /* ── Phase 5: Translate to Bulgarian ── */
  if (OPENROUTER_API_KEY) {
    console.log("Phase 5: Translating descriptions to Bulgarian...\n");

    // Load existing translations to avoid re-translating
    const existingTranslations = new Map<string, string>();
    if (existsSync(OUTPUT_PATH)) {
      try {
        const existing: DiscoveredSkill[] = JSON.parse(readFileSync(OUTPUT_PATH, "utf8"));
        for (const s of existing) {
          if (s.description !== s.descriptionEn && s.description) {
            existingTranslations.set(s.id, s.description);
          }
        }
        console.log(`  Loaded ${existingTranslations.size} existing translations.\n`);
      } catch {
        // Ignore
      }
    }

    // Apply existing translations first
    for (const skill of deduped) {
      const existing = existingTranslations.get(skill.id);
      if (existing) {
        skill.description = existing;
      }
    }

    // Find skills that still need translation
    const needsTranslation = deduped.filter((s) => s.description === s.descriptionEn);
    console.log(`  ${needsTranslation.length} skills need translation.\n`);

    // Translate in batches of 25
    const BATCH_SIZE = 25;
    let translated = 0;
    for (let i = 0; i < needsTranslation.length; i += BATCH_SIZE) {
      const batch = needsTranslation.slice(i, i + BATCH_SIZE);
      const descriptions = batch.map((s) => ({ id: s.id, text: s.descriptionEn }));

      const translations = await translateBatch(descriptions);
      for (const skill of batch) {
        const bg = translations.get(skill.id);
        if (bg) {
          skill.description = bg;
          translated++;
        }
      }

      if (translations.size > 0) {
        console.log(`  Translated batch ${Math.floor(i / BATCH_SIZE) + 1}: ${translations.size}/${batch.length}`);
      }

      // Rate limit for free tier
      await delay(4500);
    }

    console.log(`\nPhase 5 complete: ${translated} new translations.\n`);
  }

  /* ── Write output ── */
  writeFileSync(OUTPUT_PATH, JSON.stringify(deduped, null, 2));
  console.log(`=== Done! Wrote ${deduped.length} skills to ${OUTPUT_PATH} ===`);

  // Summary
  const catCounts: Record<string, number> = {};
  const bgCount = deduped.filter((s) => s.description !== s.descriptionEn).length;
  for (const s of deduped) {
    catCounts[s.category] = (catCounts[s.category] ?? 0) + 1;
  }
  console.log(`\nWith Bulgarian descriptions: ${bgCount}/${deduped.length}`);
  console.log("\nBy category:");
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
  console.log(`\nUnique repos scanned: ${processedRepos.size}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

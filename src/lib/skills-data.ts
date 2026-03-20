import {
  Code2,
  TestTube,
  Cloud,
  Brain,
  Palette,
  FileText,
  Shield,
  Megaphone,
  Database,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import githubSkillsRaw from "@/data/github-skills.json";

/* ────────────────────────────────────────── */
/*  Types                                      */
/* ────────────────────────────────────────── */

export type SkillCategory =
  | "development"
  | "testing"
  | "devops"
  | "data-ai"
  | "design"
  | "documentation"
  | "security"
  | "marketing"
  | "database"
  | "tools";

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  descriptionEn: string;
  category: SkillCategory;
  author: string;
  repo: string;
  stars: number;
  tags: string[];
  installCmd?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  platform: ("claude" | "codex" | "chatgpt")[];
  /** Raw GitHub URL to the SKILL.md file (optional) */
  skillMdUrl?: string;
  /** ISO date string when last updated */
  updatedAt?: string;
  /** Source: 'curated' or 'github' (auto-discovered) */
  source?: "curated" | "github";
}

/** Helper to find a skill by its id */
export function getSkillById(id: string): AgentSkill | undefined {
  return SKILLS.find((s) => s.id === id);
}

/** Get all skill IDs for generateStaticParams */
export function getAllSkillIds(): string[] {
  return SKILLS.map((s) => s.id);
}

/** Get related skills (same category, excluding self) */
export function getRelatedSkills(skill: AgentSkill, limit = 6): AgentSkill[] {
  return SKILLS.filter((s) => s.category === skill.category && s.id !== skill.id).slice(0, limit);
}

export interface SkillCategoryInfo {
  id: SkillCategory;
  label: string;
  labelEn: string;
  icon: LucideIcon;
  description: string;
}

/* ────────────────────────────────────────── */
/*  Categories                                 */
/* ────────────────────────────────────────── */

export const SKILL_CATEGORIES: SkillCategoryInfo[] = [
  {
    id: "development",
    label: "Разработка",
    labelEn: "Development",
    icon: Code2,
    description: "Next.js, React, TypeScript, архитектурни шаблони",
  },
  {
    id: "testing",
    label: "Тестване",
    labelEn: "Testing",
    icon: TestTube,
    description: "TDD, E2E тестове, unit тестове, QA стратегии",
  },
  {
    id: "devops",
    label: "DevOps",
    labelEn: "DevOps",
    icon: Cloud,
    description: "CI/CD, Docker, deployment, инфраструктура",
  },
  {
    id: "data-ai",
    label: "AI и данни",
    labelEn: "Data & AI",
    icon: Brain,
    description: "Машинно обучение, LLM интеграции, обработка на данни",
  },
  {
    id: "design",
    label: "Дизайн",
    labelEn: "Design",
    icon: Palette,
    description: "Tailwind CSS, UI/UX, дизайн системи, достъпност",
  },
  {
    id: "documentation",
    label: "Документация",
    labelEn: "Documentation",
    icon: FileText,
    description: "README, API документация, технически ръководства",
  },
  {
    id: "security",
    label: "Сигурност",
    labelEn: "Security",
    icon: Shield,
    description: "Одит, уязвимости, OWASP, сигурен код",
  },
  {
    id: "marketing",
    label: "Маркетинг",
    labelEn: "Marketing",
    icon: Megaphone,
    description: "SEO оптимизация, съдържание, социални мрежи",
  },
  {
    id: "database",
    label: "Бази данни",
    labelEn: "Databases",
    icon: Database,
    description: "PostgreSQL, Supabase, дизайн на схеми, миграции",
  },
  {
    id: "tools",
    label: "Инструменти",
    labelEn: "Tools",
    icon: Wrench,
    description: "Git, CLI, продуктивност, workflow автоматизация",
  },
];

/* ────────────────────────────────────────── */
/*  GitHub-discovered skills (merged at build) */
/* ────────────────────────────────────────── */

const githubSkills: AgentSkill[] = (githubSkillsRaw as AgentSkill[]).map(
  (s) => ({ ...s, source: "github" as const })
);

/* ────────────────────────────────────────── */
/*  Skills data (curated)                      */
/* ────────────────────────────────────────── */

const CURATED_SKILLS: AgentSkill[] = [
  // ── Development ──────────────────────
  {
    id: "next-best-practices",
    name: "Next.js Best Practices",
    description:
      "Най-добри практики за Next.js App Router: файлова структура, Server/Client компоненти, кеширане, metadata API и оптимизация на производителността.",
    descriptionEn:
      "Best practices for Next.js App Router including file structure, Server/Client components, caching, metadata API and performance optimization.",
    category: "development",
    author: "vercel-labs",
    repo: "https://github.com/vercel-labs/agent-skills",
    stars: 1200,
    tags: ["Next.js", "React", "App Router", "SSR"],
    installCmd: "npx skills add vercel-labs/agent-skills -y",
    difficulty: "intermediate",
    platform: ["claude", "codex", "chatgpt"],
    skillMdUrl: "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/SKILL.md",
  },
  {
    id: "react-composition",
    name: "React Composition Patterns",
    description:
      "Композиционни шаблони за React: compound components, render props, higher-order components и custom hooks за преизползваем код.",
    descriptionEn:
      "React composition patterns: compound components, render props, HOCs and custom hooks for reusable code.",
    category: "development",
    author: "vercel-labs",
    repo: "https://github.com/vercel-labs/agent-skills",
    stars: 1200,
    tags: ["React", "Patterns", "Hooks", "Components"],
    installCmd: "npx skills add vercel-labs/agent-skills -y",
    difficulty: "advanced",
    platform: ["claude", "codex", "chatgpt"],
    skillMdUrl: "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/composition-patterns/SKILL.md",
  },
  {
    id: "react-best-practices",
    name: "React Best Practices",
    description:
      "Съвременни React практики: hooks правила, memo оптимизация, error boundaries, Suspense и React 19 нови функции.",
    descriptionEn:
      "Modern React practices: hooks rules, memo optimization, error boundaries, Suspense and React 19 new features.",
    category: "development",
    author: "vercel-labs",
    repo: "https://github.com/vercel-labs/agent-skills",
    stars: 1200,
    tags: ["React", "Hooks", "Performance", "React 19"],
    installCmd: "npx skills add vercel-labs/agent-skills -y",
    difficulty: "beginner",
    platform: ["claude", "codex", "chatgpt"],
    skillMdUrl: "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/SKILL.md",
  },
  {
    id: "web-artifacts-builder",
    name: "Web Artifacts Builder",
    description:
      "\u0421\u044A\u0437\u0434\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 \u0438\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u0438 web artifacts: single-file HTML \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F, \u0434\u0435\u043C\u043E\u0442\u0430, \u043F\u0440\u043E\u0442\u043E\u0442\u0438\u043F\u0438 \u0438 \u0432\u0438\u0437\u0443\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438.",
    descriptionEn:
      "Build interactive web artifacts: single-file HTML apps, demos, prototypes and visualizations.",
    category: "development",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["HTML", "Artifacts", "Prototypes", "Demos"],
    installCmd: "npx skills add anthropics/skills web-artifacts-builder -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/web-artifacts-builder/SKILL.md",
  },

  // ── Testing ────────────────────────
  {
    id: "tdd-skill",
    name: "Test-Driven Development",
    description:
      "Методология за разработка чрез тестове: Red-Green-Refactor цикъл, писане на тестове преди код, и стратегии за покритие.",
    descriptionEn:
      "Test-driven development methodology: Red-Green-Refactor cycle, writing tests before code, and coverage strategies.",
    category: "testing",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["TDD", "Testing", "Jest", "Vitest"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "intermediate",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/test-driven-development/SKILL.md",
  },
  {
    id: "webapp-testing",
    name: "Web App Testing",
    description:
      "Цялостно тестване на уеб приложения: unit, integration, E2E с Playwright, component testing и snapshot тестове.",
    descriptionEn:
      "Comprehensive web app testing: unit, integration, E2E with Playwright, component testing and snapshot tests.",
    category: "testing",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Playwright", "E2E", "Unit Tests", "Integration"],
    installCmd: "npx skills add anthropics/skills webapp-testing -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/webapp-testing/SKILL.md",
  },
  {
    id: "systematic-debugging",
    name: "Systematic Debugging",
    description:
      "Систематичен подход за намиране и отстраняване на бъгове: binary search, logging стратегии, stack trace анализ и root cause analysis.",
    descriptionEn:
      "Systematic approach to finding and fixing bugs: binary search, logging strategies, stack trace analysis and root cause analysis.",
    category: "testing",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["Debugging", "Troubleshooting", "Logging"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "beginner",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md",
  },

  // ── DevOps ─────────────────────────
  {
    id: "vercel-deploy",
    name: "Vercel Deployment",
    description:
      "Разгръщане на Next.js приложения във Vercel: environment variables, preview deployments, edge functions и мониторинг.",
    descriptionEn:
      "Deploying Next.js apps to Vercel: environment variables, preview deployments, edge functions and monitoring.",
    category: "devops",
    author: "vercel-labs",
    repo: "https://github.com/vercel-labs/agent-skills",
    stars: 1200,
    tags: ["Vercel", "Deploy", "CI/CD", "Edge"],
    installCmd: "npx skills add vercel-labs/agent-skills -y",
    difficulty: "beginner",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/claude.ai/vercel-deploy-claimable/SKILL.md",
  },

  // ── Data & AI ──────────────────────
  {
    id: "ai-sdk-patterns",
    name: "Vercel AI SDK Patterns",
    description:
      "Шаблони за Vercel AI SDK: streaming responses, tool calling, structured output, multi-step agents и RAG архитектура.",
    descriptionEn:
      "Vercel AI SDK patterns: streaming responses, tool calling, structured output, multi-step agents and RAG architecture.",
    category: "data-ai",
    author: "vercel-labs",
    repo: "https://github.com/vercel-labs/agent-skills",
    stars: 1200,
    tags: ["AI SDK", "LLM", "Streaming", "RAG"],
    installCmd: "npx skills add vercel-labs/agent-skills -y",
    difficulty: "advanced",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-native-skills/SKILL.md",
  },
  {
    id: "mcp-builder",
    name: "MCP Builder",
    description:
      "\u0421\u044A\u0437\u0434\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 MCP (Model Context Protocol) \u0441\u044A\u0440\u0432\u044A\u0440\u0438: tool \u0434\u0435\u0444\u0438\u043D\u0438\u0446\u0438\u0438, resources, prompts \u0438 transport \u0441\u043B\u043E\u0435\u0432\u0435.",
    descriptionEn:
      "Build MCP (Model Context Protocol) servers: tool definitions, resources, prompts and transport layers.",
    category: "data-ai",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["MCP", "Protocol", "Claude", "Tools"],
    installCmd: "npx skills add anthropics/skills mcp-builder -y",
    difficulty: "advanced",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/mcp-builder/SKILL.md",
  },

  // ── Design ─────────────────────────
  {
    id: "web-design-guidelines",
    name: "Web Design Guidelines",
    description:
      "Принципи за модерен уеб дизайн: визуална йерархия, типография, цветови палитри, spacing система и responsive layout.",
    descriptionEn:
      "Modern web design principles: visual hierarchy, typography, color palettes, spacing system and responsive layout.",
    category: "design",
    author: "vercel-labs",
    repo: "https://github.com/vercel-labs/agent-skills",
    stars: 1200,
    tags: ["Design", "Typography", "Layout", "Responsive"],
    installCmd: "npx skills add vercel-labs/agent-skills -y",
    difficulty: "beginner",
    platform: ["claude", "codex", "chatgpt"],
    skillMdUrl: "https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/web-design-guidelines/SKILL.md",
  },
  {
    id: "frontend-design",
    name: "Frontend Design",
    description:
      "\u0421\u044A\u0437\u0434\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0435\u043D\u043E-\u0433\u043E\u0442\u043E\u0432\u0438 frontend \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0438 \u0441 \u0432\u0438\u0441\u043E\u043A\u043E \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043D\u0430 \u0434\u0438\u0437\u0430\u0439\u043D\u0430: responsive layouts, \u0434\u0438\u0437\u0430\u0439\u043D \u0441\u0438\u0441\u0442\u0435\u043C\u0438 \u0438 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043D\u0430 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430.",
    descriptionEn:
      "Create production-grade frontend interfaces with high design quality: responsive layouts, design systems and component architecture.",
    category: "design",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Frontend", "Design", "UI", "Components"],
    installCmd: "npx skills add anthropics/skills frontend-design -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md",
  },
  {
    id: "canvas-design-skill",
    name: "Canvas Design",
    description:
      "\u0414\u0438\u0437\u0430\u0439\u043D \u0441 HTML Canvas: \u0438\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u0438 \u0432\u0438\u0437\u0443\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438, \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438, infographics \u0438 data visualization.",
    descriptionEn:
      "Design with HTML Canvas: interactive visualizations, animations, infographics and data visualization.",
    category: "design",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Canvas", "Visualization", "Animation", "Data Viz"],
    installCmd: "npx skills add anthropics/skills canvas-design -y",
    difficulty: "advanced",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/canvas-design/SKILL.md",
  },
  {
    id: "algorithmic-art",
    name: "Algorithmic Art",
    description:
      "\u0413\u0435\u043D\u0435\u0440\u0430\u0442\u0438\u0432\u043D\u043E \u0438\u0437\u043A\u0443\u0441\u0442\u0432\u043E \u0441 \u043A\u043E\u0434: fractal patterns, noise algorithms, particle systems \u0438 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u043D\u043E \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435.",
    descriptionEn:
      "Generative art with code: fractal patterns, noise algorithms, particle systems and procedural generation.",
    category: "design",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Generative Art", "Canvas", "Fractals", "Creative Coding"],
    installCmd: "npx skills add anthropics/skills algorithmic-art -y",
    difficulty: "advanced",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/algorithmic-art/SKILL.md",
  },
  {
    id: "theme-factory",
    name: "Theme Factory",
    description:
      "\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435 \u043D\u0430 \u0442\u0435\u043C\u0438 \u0437\u0430 \u0443\u0435\u0431 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F: \u0446\u0432\u0435\u0442\u043E\u0432\u0438 \u043F\u0430\u043B\u0438\u0442\u0440\u0438, dark/light mode, CSS custom properties \u0438 design tokens.",
    descriptionEn:
      "Generate themes for web applications: color palettes, dark/light mode, CSS custom properties and design tokens.",
    category: "design",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Themes", "Colors", "Dark Mode", "Design Tokens"],
    installCmd: "npx skills add anthropics/skills theme-factory -y",
    difficulty: "beginner",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/theme-factory/SKILL.md",
  },

  // ── Documentation ───────────────────
  {
    id: "writing-plans",
    name: "Writing Implementation Plans",
    description:
      "Създаване на структурирани планове за имплементация: декомпозиция на задачи, зависимости, рискове и верификация.",
    descriptionEn:
      "Creating structured implementation plans: task decomposition, dependencies, risks and verification.",
    category: "documentation",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["Planning", "Architecture", "Documentation"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "beginner",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-plans/SKILL.md",
  },
  {
    id: "doc-coauthoring",
    name: "Document Co-Authoring",
    description:
      "\u0421\u044A\u0432\u043C\u0435\u0441\u0442\u043D\u043E \u043F\u0438\u0441\u0430\u043D\u0435 \u043D\u0430 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0438 \u0441 AI: \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u0430\u043D\u0435, \u043A\u043E\u043C\u0435\u043D\u0442\u0430\u0440\u0438, \u0432\u0435\u0440\u0441\u0438\u043E\u043D\u0438\u0440\u0430\u043D\u0435 \u0438 \u0441\u0442\u0438\u043B\u043E\u0432\u043E \u043A\u043E\u043D\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u043D\u043E\u0441\u0442.",
    descriptionEn:
      "Co-author documents with AI: editing, commenting, versioning and style consistency.",
    category: "documentation",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Documents", "Writing", "Collaboration", "Editing"],
    installCmd: "npx skills add anthropics/skills doc-coauthoring -y",
    difficulty: "beginner",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/doc-coauthoring/SKILL.md",
  },

  // ── Tools ──────────────────────────
  {
    id: "parallel-agents",
    name: "Dispatching Parallel Agents",
    description:
      "Паралелно изпълнение на агенти: Task tool, subagent types, background execution и координация между агенти.",
    descriptionEn:
      "Parallel agent execution: Task tool, subagent types, background execution and agent coordination.",
    category: "tools",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["Agents", "Parallel", "Automation", "Claude"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "advanced",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/dispatching-parallel-agents/SKILL.md",
  },
  {
    id: "brainstorming",
    name: "Brainstorming & Ideation",
    description:
      "Техники за генериране на идеи: mind mapping, SCAMPER, lateral thinking, design sprints и idea validation.",
    descriptionEn:
      "Idea generation techniques: mind mapping, SCAMPER, lateral thinking, design sprints and idea validation.",
    category: "tools",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["Brainstorming", "Ideation", "Creativity"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "beginner",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/brainstorming/SKILL.md",
  },
  {
    id: "verification-skill",
    name: "Verification Before Completion",
    description:
      "Систематична верификация преди завършване: checklist подход, edge case проверки, build validation и regression тестване.",
    descriptionEn:
      "Systematic verification before completion: checklist approach, edge case checks, build validation and regression testing.",
    category: "tools",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["Verification", "QA", "Checklist"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "beginner",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/verification-before-completion/SKILL.md",
  },
  {
    id: "executing-plans",
    name: "Executing Implementation Plans",
    description:
      "Изпълнение на планове стъпка по стъпка: task tracking, dependency resolution, progress reporting и rollback стратегии.",
    descriptionEn:
      "Step-by-step plan execution: task tracking, dependency resolution, progress reporting and rollback strategies.",
    category: "tools",
    author: "obra",
    repo: "https://github.com/obra/superpowers",
    stars: 500,
    tags: ["Execution", "Planning", "Tracking"],
    installCmd: "npx skills add obra/superpowers -y",
    difficulty: "beginner",
    platform: ["claude", "codex"],
    skillMdUrl: "https://raw.githubusercontent.com/obra/superpowers/main/skills/executing-plans/SKILL.md",
  },
  {
    id: "pdf-skill",
    name: "PDF Generation",
    description:
      "\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435 \u043D\u0430 PDF \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0438: \u0444\u0430\u043A\u0442\u0443\u0440\u0438, \u0434\u043E\u043A\u043B\u0430\u0434\u0438, \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u0438 \u0438 \u0444\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u0430\u043D\u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0438 \u0441 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0435\u043D \u043A\u043E\u043D\u0442\u0440\u043E\u043B.",
    descriptionEn:
      "Generate PDF documents: invoices, reports, certificates and formatted documents with programmatic control.",
    category: "tools",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["PDF", "Documents", "Reports", "Generation"],
    installCmd: "npx skills add anthropics/skills pdf -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pdf/SKILL.md",
  },
  {
    id: "docx-skill",
    name: "DOCX Generation",
    description:
      "\u0421\u044A\u0437\u0434\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 Word \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0438 (DOCX): \u0444\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u0430\u043D\u0435, \u0442\u0430\u0431\u043B\u0438\u0446\u0438, \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F, headers/footers \u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0438.",
    descriptionEn:
      "Create Word documents (DOCX): formatting, tables, images, headers/footers and templates.",
    category: "tools",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["DOCX", "Word", "Documents", "Templates"],
    installCmd: "npx skills add anthropics/skills docx -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/docx/SKILL.md",
  },
  {
    id: "xlsx-skill",
    name: "Excel Spreadsheets",
    description:
      "\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0435 \u043D\u0430 Excel \u0444\u0430\u0439\u043B\u043E\u0432\u0435 (XLSX): \u0442\u0430\u0431\u043B\u0438\u0446\u0438, \u0444\u043E\u0440\u043C\u0443\u043B\u0438, \u0433\u0440\u0430\u0444\u0438\u043A\u0438, pivot tables \u0438 \u0444\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u0430\u043D\u0435.",
    descriptionEn:
      "Generate Excel files (XLSX): tables, formulas, charts, pivot tables and formatting.",
    category: "tools",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Excel", "XLSX", "Spreadsheets", "Data"],
    installCmd: "npx skills add anthropics/skills xlsx -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/xlsx/SKILL.md",
  },
  {
    id: "pptx-skill",
    name: "PowerPoint Presentations",
    description:
      "\u0421\u044A\u0437\u0434\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 \u043F\u0440\u0435\u0437\u0435\u043D\u0442\u0430\u0446\u0438\u0438 (PPTX): \u0441\u043B\u0430\u0439\u0434\u043E\u0432\u0435, \u043B\u0435\u0439\u0430\u0443\u0442\u0438, \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438, \u0433\u0440\u0430\u0444\u0438\u043A\u0438 \u0438 \u0431\u0440\u0430\u043D\u0434\u0438\u0440\u0430\u043D\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0438.",
    descriptionEn:
      "Create presentations (PPTX): slides, layouts, animations, charts and branded templates.",
    category: "tools",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["PowerPoint", "PPTX", "Presentations", "Slides"],
    installCmd: "npx skills add anthropics/skills pptx -y",
    difficulty: "intermediate",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/pptx/SKILL.md",
  },
  {
    id: "skill-creator",
    name: "Skill Creator",
    description:
      "\u0421\u044A\u0437\u0434\u0430\u0432\u0430\u043D\u0435 \u043D\u0430 \u043D\u043E\u0432\u0438 AI agent skills: SKILL.md \u0444\u043E\u0440\u043C\u0430\u0442, frontmatter, \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430, \u0442\u0435\u0441\u0442\u0432\u0430\u043D\u0435 \u0438 \u043F\u0443\u0431\u043B\u0438\u043A\u0443\u0432\u0430\u043D\u0435 \u0432 GitHub.",
    descriptionEn:
      "Create new AI agent skills: SKILL.md format, frontmatter, structure, testing and publishing to GitHub.",
    category: "tools",
    author: "anthropics",
    repo: "https://github.com/anthropics/skills",
    stars: 900,
    tags: ["Skills", "SKILL.md", "Authoring", "Publishing"],
    installCmd: "npx skills add anthropics/skills skill-creator -y",
    difficulty: "beginner",
    platform: ["claude"],
    skillMdUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md",
  },

].map((s) => ({ ...s, source: "curated" as const })) as AgentSkill[];

/* ────────────────────────────────────────── */
/*  Merged skills: curated first, then GitHub  */
/* ────────────────────────────────────────── */

function mergeSkills(): AgentSkill[] {
  const seen = new Set<string>();
  const merged: AgentSkill[] = [];

  // Build GitHub repo→stars lookup for real star counts
  const repoStars = new Map<string, number>();
  for (const s of githubSkills) {
    const existing = repoStars.get(s.repo) ?? 0;
    if (s.stars > existing) repoStars.set(s.repo, s.stars);
  }

  // Curated skills take priority (use real stars from GitHub when available)
  for (const s of CURATED_SKILLS) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      const realStars = repoStars.get(s.repo);
      merged.push(realStars !== undefined ? { ...s, stars: realStars } : s);
    }
  }

  // Append GitHub-discovered skills (skip duplicates)
  for (const s of githubSkills) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      merged.push(s);
    }
  }

  return merged;
}

/** All skills — curated + GitHub-discovered, deduplicated */
export const SKILLS: AgentSkill[] = mergeSkills();

/* ────────────────────────────────────────── */
/*  Section metadata                           */
/* ────────────────────────────────────────── */

export const SKILLS_SECTION = {
  tag: "AI AGENT SKILLS",
  title: "Директория за",
  titleAccent: "AI Умения",
  subtitle:
    "Курирана колекция от най-полезните AI agent skills за разработчици. Открийте, научете и инсталирайте умения за Claude Code, Codex CLI и ChatGPT.",
};

export const SKILLS_FAQ = [
  {
    question: "Какво представляват AI Agent Skills?",
    answer:
      "AI Agent Skills са файлове с инструкции (SKILL.md), които разширяват възможностите на AI кодиращи агенти като Claude Code, OpenAI Codex CLI и ChatGPT. Всеки skill съдържа специализирани знания и правила, които агентът следва при изпълнение на конкретни задачи.",
  },
  {
    question: "Как да инсталирам skill?",
    answer:
      "Използвайте командата npx skills add <автор/репо> -y в терминала на проекта. Skill-ът се инсталира в директорията .claude/skills/ и е готов за използване веднага. Можете също да създадете собствен SKILL.md файл ръчно.",
  },
  {
    question: "Кои AI агенти поддържат skills?",
    answer:
      "SKILL.md форматът е отворен стандарт, поддържан от Claude Code (Anthropic), Codex CLI (OpenAI), ChatGPT и VS Code Copilot. Всеки агент, имплементиращ Agent Skills стандарта, може да използва тези умения.",
  },
  {
    question: "Безплатни ли са тези skills?",
    answer:
      "Да, всички skills в тази директория са с отворен код и напълно безплатни. Те се хостват в публични GitHub хранилища и могат да се използват свободно в проекти от всякакъв мащаб.",
  },
  {
    question: "Мога ли да създам собствен skill?",
    answer:
      "Абсолютно! Създайте файл SKILL.md в папка .claude/skills/моят-skill/ на вашия проект. Файлът съдържа YAML frontmatter с name и description, последван от Markdown инструкции. Claude Code автоматично ще открие и използва вашия skill.",
  },
];

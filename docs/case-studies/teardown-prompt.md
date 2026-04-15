# Case Study Teardown Prompt

Използвай този промпт в **всеки клиентски проект** (Vrachka, HOT22, Euphoria, Profiline, Ivanovi-AM, Bacho Iliya, Your Moment, Exotic Flowers), за да извлечеш реалния technical profile, който после се mappва директно към полетата на `CaseStudy` в `level8-web/src/lib/case-studies.ts`.

---

## PROMPT (copy-paste в Claude Code вътре в клиентския проект)

```
Ти си senior tech writer + staff engineer, който подготвя публично case study за
агенцията Level 8 (level8.bg). Това е нашият собствен проект — имаш пълен достъп
до кода, миграциите, env.example, package.json, git history.

ЦЕЛ: Произведи технически teardown на този проект във фиксиран JSON формат.
Изходът ще се публикува публично на https://level8.bg/projects/<slug> — трябва
да е точен, НЕ маркетингов и без секретни данни.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
СТЪПКА 1 — RECON (преди да пишеш каквото и да е)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Прочети (не предполагай, отвори файловете):
- package.json (dependencies + scripts)
- README.md (ако има)
- next.config.* / vite.config.* / nuxt.config.* — framework + optimizations
- .env.example (за да знаеш към кои external services сме закачени)
- supabase/migrations/ ИЛИ prisma/schema.prisma ИЛИ drizzle schema — data model
- src/app/api/ ИЛИ src/pages/api/ — API endpoints (списък)
- middleware.ts / proxy.ts — auth + route guards
- src/lib/ — key services (AI, payments, email, cron)
- git log --oneline -20 (recent work focus)
- vercel.json / netlify.toml (deploy config, crons)

Ако видиш неща, които не разбираш — отвори ги преди да обобщаваш.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
СТЪПКА 2 — OUTPUT (JSON, строго в този формат)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Върни САМО JSON блок (без обяснителен текст преди/след), който да бъде
вмъкнат директно в case-studies.ts като optional полета.

{
  "architecture": {
    "summary": "2-3 изречения какво е това приложение архитектурно",
    "diagram": {
      "nodes": [
        { "id": "user", "label": "Потребител", "type": "actor" },
        { "id": "web", "label": "Next.js 16 (ISR)", "type": "frontend" },
        { "id": "db", "label": "Supabase Postgres", "type": "database" },
        { "id": "ai", "label": "OpenAI GPT-4", "type": "external" }
      ],
      "edges": [
        { "from": "user", "to": "web", "label": "HTTPS" },
        { "from": "web", "to": "db", "label": "SSR query" },
        { "from": "web", "to": "ai", "label": "Edge function" }
      ]
    },
    "dataFlow": [
      "Регистрация: user → Clerk/Supabase Auth → trigger създава profile row",
      "Генериране на хороскоп: user POST → edge function → OpenAI → insert в readings table → realtime push обратно"
    ]
  },

  "technicalDecisions": [
    {
      "question": "Защо Supabase вместо Firebase?",
      "chose": "Supabase",
      "rejected": ["Firebase", "PlanetScale + NextAuth"],
      "reasoning": "Row Level Security на ниво Postgres дава per-user isolation без application-layer проверки. Firebase security rules биха изисквали дублиране на логиката.",
      "tradeoff": "По-сложна локална разработка срещу Firebase. Приехме го, защото production security е приоритет."
    }
  ],

  "techStackDetailed": {
    "frontend": ["Next.js 16 App Router", "React Server Components", "Tailwind v4"],
    "backend": ["Next.js API routes", "Supabase Edge Functions (Deno)"],
    "database": ["Postgres 15 (Supabase)", "pgvector за embeddings"],
    "auth": ["Supabase Auth (magic link + Google OAuth)"],
    "payments": ["Stripe Checkout + webhook"],
    "ai": ["OpenAI GPT-4 Turbo", "custom prompt chaining"],
    "infrastructure": ["Vercel (Pro tier)", "Supabase (Pro)", "Cloudflare DNS"],
    "monitoring": ["Vercel Analytics", "Sentry", "Supabase Logs"],
    "ci": ["GitHub Actions", "Vercel preview deploys"]
  },

  "challenges": [
    {
      "title": "Rate limiting на OpenAI при пикове",
      "problem": "При лансиране трафикът се утрои за 48ч — OpenAI 429 грешки започнаха да блокират генерациите.",
      "solution": "Въведохме Upstash Redis queue + exponential backoff + кеш на популярни заявки (зодиак + дата). Резултат: нулеви failed generations, -40% разход към OpenAI.",
      "filesPaths": ["src/lib/openai-queue.ts", "src/lib/cache/horoscope-cache.ts"]
    }
  ],

  "performance": {
    "lighthouse": {
      "performance": 98,
      "accessibility": 95,
      "bestPractices": 100,
      "seo": 100
    },
    "coreWebVitals": {
      "lcp": "1.2s",
      "inp": "78ms",
      "cls": "0.02"
    },
    "bundleSize": {
      "firstLoadJs": "142 KB",
      "largestRoute": "/dashboard (198 KB)"
    }
  },

  "livingMetrics": {
    "notes": "Числа, които се променят с времето — използвай ги, но знай, че ще остарят.",
    "activeUsers": "2100 (30-day active)",
    "dailyGenerations": "~450",
    "dbSize": "1.8 GB",
    "monthlyStripeVolume": "не разкривай точни приходи — само 'growing MoM'"
  },

  "lessonsLearned": [
    {
      "title": "ISR revalidation + AI съдържание = внимание",
      "detail": "Използвахме Next ISR за публични страници с AI generated съдържание. Сблъсъкът: кога да invalidate-нем кеша? Решение: on-demand revalidation чрез Supabase webhook при нов insert.",
      "wouldDoDifferently": "Следващ път бих започнал с React Cache Components от ден 1, вместо ISR."
    }
  ],

  "codeHighlights": [
    {
      "title": "Streaming OpenAI response към клиента",
      "why": "Хороскоп се генерира 8-12 секунди — ако user чака blank loader, bounce rate скача. Streaming решава UX проблема.",
      "snippet": "// Покажи 10-20 реда санитизиран код — БЕЗ prompts, БЕЗ env vars.\nexport async function POST(req: Request) {\n  const stream = await openai.chat.completions.create({...});\n  return new Response(stream.toReadableStream());\n}",
      "filePath": "src/app/api/generate/route.ts"
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
СТЪПКА 3 — ПРАВИЛА ЗА СИГУРНОСТ (задължителни)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

НЕ включвай в output-а:
- Истински env var стойности (API keys, DB credentials, webhook secrets)
- Пълни AI system prompts (показвай само първите 2-3 реда като example)
- SQL схеми с sensitive колони (PII, payment data)
- Git URL-и към private branches
- Имена на реални клиенти/потребители (освен името на самия бизнес-клиент)
- Revenue цифри в абсолютна стойност (използвай MoM %, growth, или "NDA")

Включи:
- Публични technology choices
- Архитектурни патърни (RSC, ISR, edge functions)
- Open-source библиотеки с версии
- Generic code snippets, които показват подход, не логика
- Проблеми и решения (lessons learned)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
СТЪПКА 4 — ТОН
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Пиши на български. Тех термините остават на английски (ISR, RSC, webhook, queue).
- Конкретни, не generic. "Използвахме Postgres" е слабо. "Postgres 15 с pgvector
  за semantic search на 12k horoscope records" е силно.
- Показвай tradeoffs, не само wins. Всяка технология има цена — ние я знаем.
- Никакви superlatives ("revolutionary", "game-changing", "world-class"). Фактите говорят.

Започни с recon. Не пиши JSON-а преди да си отворил поне 10 файла.
```

---

## Как да използваме output-а

1. Клиентският проект (Vrachka, HOT22, и т.н.) връща JSON.
2. Вземаме JSON-а и го paste-ваме в съответния entry в `src/lib/case-studies.ts` — като нови optional полета: `architecture`, `technicalDecisions`, `techStackDetailed`, `challenges`, `performance`, `livingMetrics`, `lessonsLearned`, `codeHighlights`.
3. `/projects/[slug]/page.tsx` рендерира новите секции условно: ако полето съществува → показва, иначе скрива.
4. Повтаряме за всичките 8 проекта. Level 8 `/projects` става реален tech portfolio, не маркетинг брошура.

## Quality checklist преди публикуване

- [ ] Няма env keys, DB credentials, full prompts
- [ ] Метриките са проверими (Lighthouse screenshot, Vercel analytics)
- [ ] Code snippets са sanitized (без proprietary логика)
- [ ] Tradeoffs са включени (не само positives)
- [ ] Клиентското име е ok с публикуването (верифицирай)

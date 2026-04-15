import type { CaseStudy } from "@/types";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "euphoria-beauty",
    name: "Euphoria Beauty",
    tagline: "Онлайн резервации за козметичен салон",
    heroImage: "/projects/euphoria-beauty.webp",
    liveUrl: "https://euphoriabeauty.eu/",
    category: "Уебсайт",
    tags: ["Next.js", "Tailwind CSS", "Резервации", "SEO"],
    primaryMetric: { value: "+180%", label: "Ръст на онлайн резервации" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "Euphoria Beauty е козметичен салон в София с утвърдена репутация и лоялна клиентска база. Въпреки качеството на услугите, салонът нямаше модерно онлайн присъствие — старият сайт беше бавен, неадаптивен за мобилни устройства и без възможност за онлайн резервации.",
        "Клиентите се записваха само по телефон, което създаваше загуби в пиковите часове и пропуснати резервации. Конкурентни салони с удобни онлайн системи привличаха все повече клиенти.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Изградихме модерен, бързо зареждащ се уебсайт с вграден модул за онлайн резервации. Дизайнът отразява луксозната атмосфера на салона — елегантни цветове, професионална галерия и представяне на екипа от специалисти.",
        "Системата за резервации позволява на клиентите да изберат услуга, специалист, дата и час — 24/7, без телефонно обаждане. Автоматични напомняния по SMS намаляват неявяванията.",
      ],
      features: [
        "Responsive дизайн, оптимизиран за мобилни устройства",
        "Онлайн система за резервации с календар в реално време",
        "Галерия с професионални снимки на процедури и резултати",
        "Представяне на екипа и техните специализации",
        "SEO оптимизация за локално търсене в София",
        "Интеграция с Google Maps и Google Business",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Analytics"],
    results: {
      title: "Резултати",
      description: "В рамките на 3 месеца след пускането, онлайн каналът се превърна в основен източник на нови резервации за салона.",
      metrics: [
        { value: "+180%", label: "Ръст на онлайн резервации" },
        { value: "65%", label: "Резервации от мобилни устройства" },
        { value: "-40%", label: "Спад на неявяванията" },
        { value: "1.2s", label: "Време за зареждане (LCP)" },
      ],
    },
    testimonialId: "euphoria",
    duration: "4 седмици",
    year: "2024",
    metaTitle: "Euphoria Beauty — Case Study | ЛЕВЕЛ 8",
    metaDescription: "Как създадохме модерен уебсайт с онлайн резервации за козметичен салон Euphoria Beauty и увеличихме резервациите с 180%.",
  },
  {
    slug: "vrachka",
    name: "Vrachka.eu",
    tagline: "AI астрология платформа с персонализирани хороскопи",
    heroImage: "/projects/vrachka.webp",
    liveUrl: "https://www.vrachka.eu/",
    category: "Уеб приложение",
    tags: ["Next.js", "OpenAI", "Stripe", "PostgreSQL"],
    primaryMetric: { value: "2 000+", label: "Активни потребители" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "Основателят на Vrachka имаше визия за AI-базирана астрология платформа — нещо, което не съществуваше на българския пазар. Идеята беше да се съчетае традиционната астрология с изкуствен интелект за персонализирани хороскопи и таро четения.",
        "Предизвикателството беше да се създаде цялата платформа от нулата — от AI системата, през потребителския интерфейс, до абонаментния модел с плащания. Нямаше съществуваща кодова база или прототип.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Разработихме пълнофункционално уеб приложение с интеграция на OpenAI API за генериране на персонализирани хороскопи и таро четения. Платформата предлага безплатни и премиум функции с абонаментни планове.",
        "Създадохме система за потребителски профили, история на четенията и персонализирани препоръки. Дизайнът е мистериозен и елегантен, съобразен с тематиката на астрологията.",
      ],
      features: [
        "AI генериране на персонализирани дневни, седмични и месечни хороскопи",
        "Интерактивни таро четения с визуални анимации",
        "Абонаментна система с безплатен и премиум план",
        "Интеграция със Stripe за онлайн плащания",
        "Потребителски профили с история на четенията",
        "Responsive дизайн с тематични анимации",
      ],
    },
    techStack: ["Next.js", "TypeScript", "OpenAI API", "PostgreSQL", "Stripe", "Vercel"],
    results: {
      title: "Резултати",
      description: "Платформата привлече хиляди потребители и се утвърди като уникален продукт на българския пазар за AI-базирана астрология.",
      metrics: [
        { value: "2 000+", label: "Активни потребители" },
        { value: "15 000+", label: "Генерирани хороскопи месечно" },
        { value: "4.8/5", label: "Потребителска оценка" },
        { value: "12%", label: "Конверсия безплатен → премиум" },
      ],
    },
    testimonialId: "vrachka",
    duration: "6 седмици",
    year: "2024",
    metaTitle: "Vrachka.eu — AI астрология платформа | ЛЕВЕЛ 8",
    metaDescription: "Как изградихме AI астрология платформа с персонализирани хороскопи и таро четения от нулата — 2000+ активни потребители.",
    screenshots: [
      {
        src: "/projects/vrachka-full-desktop-home.png",
        alt: "Vrachka.eu — начална страница на desktop (full page)",
        device: "desktop",
        caption: "Home — скролни вътре в монитора",
        path: "/",
      },
      {
        src: "/projects/vrachka-full-desktop-horoscope.png",
        alt: "Vrachka.eu — дневен хороскоп (full page)",
        device: "desktop",
        caption: "Daily horoscope — всичките 12 зодии",
        path: "/horoscope",
      },
      {
        src: "/projects/vrachka-full-mobile-home.png",
        alt: "Vrachka.eu mobile — начална страница (full page)",
        device: "mobile",
        caption: "Mobile home",
      },
      {
        src: "/projects/vrachka-full-mobile-horoscope.png",
        alt: "Vrachka.eu mobile — хороскоп (full page)",
        device: "mobile",
        caption: "Mobile horoscope",
      },
    ],
    architecture: {
      summary:
        "Next.js 16 App Router монорепо на Vercel, което обединява SaaS (subscriptions + 7 one-time paid products), e-commerce (dropshipping магазин), content platform (блог + 188 learn guides), AI оракул и астрономическо ядро за изчисляване на натални карти в реално време. Всичко SSR/ISR на Vercel Edge + Supabase Postgres като single source of truth.",
      diagram: {
        nodes: [
          { id: "user", label: "Потребител (BG/EN)", type: "actor" },
          { id: "edge", label: "Vercel Edge Middleware", type: "frontend" },
          { id: "next", label: "Next.js 16 (RSC + ISR)", type: "frontend" },
          { id: "supabase", label: "Supabase Postgres + Auth", type: "database" },
          { id: "openrouter", label: "OpenRouter (Gemini 3.1)", type: "external" },
          { id: "stripe", label: "Stripe Checkout + Webhook", type: "external" },
          { id: "resend", label: "Resend (transactional)", type: "external" },
          { id: "sweph", label: "sweph-wasm (Swiss Ephemeris)", type: "external" },
          { id: "cron", label: "Vercel Cron (16 jobs)", type: "backend" },
          { id: "workflow", label: "Vercel Workflow DevKit", type: "backend" },
        ],
        edges: [
          { from: "user", to: "edge", label: "HTTPS" },
          { from: "edge", to: "next", label: "i18n + auth guard" },
          { from: "next", to: "supabase", label: "RSC query (SSR)" },
          { from: "next", to: "sweph", label: "runtime WASM" },
          { from: "next", to: "openrouter", label: "AI fallback chain" },
          { from: "user", to: "stripe", label: "Checkout redirect" },
          { from: "stripe", to: "next", label: "Webhook" },
          { from: "next", to: "resend", label: "transactional" },
          { from: "cron", to: "workflow", label: "durable steps" },
          { from: "workflow", to: "openrouter", label: "batch AI" },
        ],
      },
      dataFlow: [
        "Регистрация: client POST /api/auth/register → service-role supabase.auth.admin.generateLink() → Resend transactional email → user clicks link → /auth/callback exchanges code for session → middleware enforces email_confirmed_at + onboarding_completed.",
        "Натална карта (FREE lead magnet): RSC fetch profile.birth_date → lib/astrology/natal-chart-sweph.ts зарежда WASM + ephemeris .se1 файлове → изчислява планетни позиции, houses, aspects → AI интерпретация (Gemini 3.1 Flash Lite) → insert natal_charts row → render.",
        "Платен продукт (€19-49): client → /api/[product]/checkout (Zod-валидиран) → Stripe Checkout → webhook /api/webhooks/stripe → getSubscriptionPeriod helper (handles 2025-09-30.clover API migration) → идемпотентен insert в paid_products + purchases → Resend receipt → redirect към /success.",
        "Дневен хороскоп (16 крон jobs): Vercel Cron → withWorkflow() → 12 sign-scoped durable steps → всяка извиква OpenRouter с fallback chain (Gemini 3.1 Pro → Flash Lite → DeepSeek) → upsert в horoscopes table (unique по sign+period+language+date) → next ISR revalidation.",
        "Middleware redirects: 60+ статични redirects в next.config.js + dynamic redirects table в Postgres (5-min in-memory cache) → i18n locale strip → Supabase auth check на /dashboard|/admin|/tools → email_confirmed_at enforcement.",
      ],
    },
    technicalDecisions: [
      {
        question: "OpenRouter+Gemini или OpenAI GPT-4 за AI генерация?",
        chose: "OpenRouter с Gemini 3.1 Pro/Flash Lite + DeepSeek fallback",
        rejected: ["OpenAI GPT-4 Turbo", "Anthropic Claude 3.5 Sonnet direct"],
        reasoning:
          "Gemini 3.1 Pro Preview работи отлично с кирилица (critical за BG пазара) при 10x по-ниска цена от GPT-4 Turbo. OpenRouter дава един HTTP клиент с декларативен fallback ако primary пропадне. Критично: gemini-2.5-flash е thinking model, което хаби tokens на вътрешно reasoning — сменено с gemini-3.1-flash-lite за всички дневни features.",
        tradeoff:
          "Gemini Preview endpoints нямат production SLA като OpenAI. Рискът се контролира с 3-tier fallback chain (Pro → Flash Lite → DeepSeek) и cost tracker на всяка заявка.",
      },
      {
        question: "Swiss Ephemeris в Node.js vs отделен Python service?",
        chose: "sweph-wasm (WebAssembly) в същия Next.js runtime",
        rejected: [
          "Отделен Python FastAPI + pyswisseph",
          "Astronomy Engine (JS-only, по-ниска точност за houses)",
        ],
        reasoning:
          "Един deploy target (Vercel serverless), зеро cross-service network latency, типобезопасен интерфейс от TypeScript. Запазваме astronomy-engine като fallback за daily общи позиции където точността е достатъчна.",
        tradeoff:
          "WASM binary + .se1 ephemeris files са ~20 MB — налага outputFileTracingIncludes в next.config.js за route-specific bundling. Cold start на routes с chart изчисления е с 300-500 ms по-бавен от pure-JS route.",
      },
      {
        question: "Supabase vs self-hosted Postgres + NextAuth?",
        chose: "Supabase",
        rejected: ["Neon + NextAuth", "PlanetScale + Clerk"],
        reasoning:
          "Row Level Security на ниво Postgres премахва application-layer permission checks — RLS policies на paid_products, purchases, winner_products, natal_charts изолират per-user данни автоматично дори ако API route забрави auth проверка. Supabase Auth + Storage + Realtime + Edge Functions в един dashboard съкращава ops повърхността.",
        tradeoff:
          "Vendor lock-in на auth schema (auth.users референции навсякъде). Migration към self-hosted би изисквало copy на auth.users → public.users + превключване на всички FK-и. Приехме риска защото RLS + instant Admin API са по-ценни в текущата скала.",
      },
      {
        question: "Heavy crons: Lambda queue или Workflow DevKit?",
        chose: "Vercel Workflow DevKit ('use workflow' / 'use step')",
        rejected: ["Upstash Redis queue + cron retry", "AWS SQS + Lambda consumer"],
        reasoning:
          "Дневната хороскоп крон прави 192 AI calls (12 signs × 4 periods × 2 languages × 2 прохода) и удряше 60s Vercel serverless timeout. Workflow DevKit дава durable steps per-zodiac — всеки sign е отделна step която може да retry независимо без пре-run цялата батчия. Zero нови инфраструктурни компоненти.",
        tradeoff:
          "Workflow DevKit е в beta (version 4.2.0-beta.70). Пазим non-workflow версия като fallback (/api/cron/generate-horoscopes-v2) за 2 седмици след миграция. Debug изисква четене на Workflow traces в Vercel UI.",
      },
      {
        question: "HTML sanitizer за AI-генериран блог контент?",
        chose: "sanitize-html (pure JS)",
        rejected: ["isomorphic-dompurify", "dompurify + jsdom"],
        reasoning:
          "isomorphic-dompurify тегли jsdom → @exodus/bytes (ESM) → ERR_REQUIRE_ESM на Vercel Node runtime. Sanitize-html е pure JS, няма DOM dependency, работи на edge и node, поддържа whitelist за YouTube/Spotify iframes.",
        tradeoff:
          "Sanitize-html v2 стрипва ВСИЧКИ HTML коментари (няма config за keeping). Всички бизнес маркери в контента са мигрирани от HTML comments към div с data-marker атрибути преди sanitizer да се включи в pipeline-а.",
      },
    ],
    techStackDetailed: {
      frontend: [
        "Next.js 16.1.6 App Router (Turbopack)",
        "React 19.2",
        "TypeScript 5.9",
        "Tailwind v4 (PostCSS plugin)",
        "Radix UI primitives",
        "framer-motion 12",
        "three.js + @react-three/fiber",
        "recharts",
        "next-intl 4.8 (bg + en)",
      ],
      backend: [
        "Next.js API Routes (Node runtime)",
        "Vercel Workflow DevKit",
        "Middleware.ts (auth + DB redirects + i18n)",
        "Zod 4 request validation",
      ],
      database: [
        "Supabase PostgreSQL",
        "147+ SQL migrations",
        "Row Level Security policies",
        "Realtime subscriptions",
      ],
      auth: [
        "Supabase Auth",
        "Email verification чрез Resend (custom)",
        "Google OAuth",
        "Middleware-enforced email_confirmed_at + onboarding gates",
      ],
      payments: [
        "Stripe Checkout (subscription + one-time)",
        "Webhook handler с идемпотентност",
        "getSubscriptionPeriod helper за 2025-09-30.clover миграция",
        "7 paid products + 2 subscription tiers",
      ],
      ai: [
        "OpenRouter (primary AI gateway)",
        "Gemini 3.1 Pro Preview (synastry, karmic, career)",
        "Gemini 3.1 Flash Lite (horoscopes, tarot, dreams)",
        "Gemini 3 Flash (long-form blog ~3000+ words)",
        "DeepSeek v3 (tertiary fallback)",
      ],
      astrology: [
        "sweph-wasm 2.6.9 (Swiss Ephemeris WASM)",
        "astronomy-engine 2.1.19",
        "circular-natal-horoscope-js",
        "Custom lib/astrology: solar return, profections, firdaria, transits, synastry",
      ],
      email: [
        "Resend 6.9 + @react-email/components 1.0",
        "React Email templates (verify, welcome, horoscope, receipt)",
        "IMAP inbox viewer (imapflow + mailparser)",
      ],
      infrastructure: [
        "Vercel (hosting + crons + edge)",
        "Supabase Pro",
        "Cloudflare (DNS only)",
        "PWA чрез @ducanh2912/next-pwa + custom service worker",
        "16 Vercel Cron jobs",
      ],
      monitoring: [
        "Vercel Analytics + Speed Insights",
        "Microsoft Clarity (session recordings)",
        "Google Analytics 4 + Search Console",
        "Custom health-alerts cron",
        "webhook_error_logs table",
      ],
      testing: [
        "Vitest 4 (45+ tests)",
        "Playwright 1.58 (E2E + visual)",
        "TypeScript strict + next lint",
      ],
    },
    challenges: [
      {
        title: "Stripe API 2025-09-30.clover миграция счупи webhook-а",
        problem:
          "Stripe преместиха current_period_start/end от Subscription root в items[0]. Стари event-и се replay-ват с root shape, нови идват с item shape. Без единна signature, new Date(undefined * 1000).toISOString() хвърляше 'Invalid time value' при всеки webhook и затриваше paid orders.",
        solution:
          "Extract-нахме lib/stripe/get-subscription-period.ts helper който чете ПЪРВО от items[0], FALLBACK на root. Throws с sub.id в грешката. Правило: никога не чети period fields директно. Плюс processing_started_at heartbeat колона за идемпотентен reprocess на stale events (>5 min).",
        filesPaths: [
          "lib/stripe/get-subscription-period.ts",
          "app/api/webhooks/stripe/route.ts",
        ],
      },
      {
        title: "Дневна хороскоп крон удряше 60s Vercel timeout",
        problem:
          "Понеделник сутрин crona трябваше да генерира daily + weekly × 12 signs × 2 languages = 48 AI calls за <60s. OpenRouter tail latency + Supabase writes превишаваха бюджета половината дни — retries се натрупваха.",
        solution:
          "Миграция към Vercel Workflow DevKit. Всеки sign е отделна durable 'use step'. Step-овете работят паралелно и retry-ват независимо. Резултат: 0 timeout грешки за 3 седмици, 40% по-нисък p99 latency.",
        filesPaths: [
          "workflows/horoscope-generation/index.ts",
          "app/api/cron/generate-horoscopes-v2/route.ts",
        ],
      },
      {
        title: "Swiss Ephemeris + Vercel serverless cold starts",
        problem:
          "sweph-wasm изисква WASM binary + .se1 ephemeris файлове (~20 MB) на runtime. Next.js static tracer ги пропускаше при bundling serverless function — production route хвърляше 'ENOENT: sepl_18.se1'.",
        solution:
          "Explicit outputFileTracingIncludes в next.config.js за всеки route който прави chart calculations. Списъкът включва node_modules/sweph-wasm/dist/wasm/ и node_modules/sweph-wasm/dist/ephe/. Cold start +300-500 ms но chart math е точен.",
        filesPaths: ["next.config.js", "lib/astrology/natal-chart-sweph.ts"],
      },
      {
        title: "Dynamic redirects без database хит на всеки request",
        problem:
          "Имаме 60+ редиректа в next.config.js (build-time) плюс dynamic redirects в Postgres (админа добавя ad-hoc). Всеки middleware hit не може да прави SQL заявка — би удвоил latency.",
        solution:
          "In-memory Map cache с 5-min TTL в middleware.ts. Първата заявка след TTL зарежда всички active redirects наведнъж, последващите четат от memory. Stale cache се сервира ако DB call пропадне — нулев downtime при Supabase incidents.",
        filesPaths: ["middleware.ts"],
      },
      {
        title: "Pythagoras Matrix transposed layout в 2 места",
        problem:
          "Библиотеката lib/numerology/pythagoras-matrix.ts рендираше cells като [[1,2,3],[4,5,6],[7,8,9]] (row-major), но класическата руска Питагорова школа използва [[1,4,7],[2,5,8],[3,6,9]]. Row/column семантиката беше разменена.",
        solution:
          "Пренаписан lib файл с transposed matrix + нови row/column ключове. UI компонент обнови iteration order. Безопасно за платени yearly-report-и защото pythagoras_matrix не се чете от DB JSON — пре-изчислява се на всяко отваряне от birth_date.",
        filesPaths: [
          "lib/numerology/pythagoras-matrix.ts",
          "components/yearly-report/PythagorasMatrix.tsx",
        ],
      },
    ],
    performance: {
      notes:
        "PageSpeed mobile е active work area — подобрено от 37 на 55+ чрез framer-motion code-split, CSS-only ScrollReveal вместо framer на landing, GPU-composited gradient animations. AdSense е критичен за приходите и не се defer-ва.",
      lighthouse: {
        performance: 55,
        accessibility: 92,
        bestPractices: 88,
        seo: 98,
      },
      coreWebVitals: {
        lcp: "~2.4s (mobile 4G)",
        inp: "~200ms",
        cls: "<0.1",
      },
      bundleSize: {
        firstLoadJs: "~180 KB gzipped",
        largestRoute: "/yearly-report/[year] (~250 KB)",
      },
    },
    livingMetrics: {
      notes:
        "Числата отразяват състояние март-април 2026 и ще остареят. Revenue — NDA, само растеж MoM.",
      routes: "238 API routes, 54 public page routes",
      migrations: "147+ SQL migrations",
      cronJobs: "16 scheduled jobs",
      monthlyOrganicTraffic: "~1,400 sessions (GSC)",
      paidProducts: "7 one-time + 2 subscription tiers",
      i18n: "2 locales (bg primary, en)",
      dailyAIGenerations: "~200-400",
      monthlyStripeVolume: "growing MoM (NDA)",
    },
    lessonsLearned: [
      {
        title: "Никога не съхранявай business markers като HTML коментари",
        detail:
          "Използвахме HTML comments маркери в AI-генериран блог контент за да ги парсим в ISR. Когато upgraded от isomorphic-dompurify към sanitize-html v2 (наложено от Vercel ESM build failure), sanitizer стрипваше всички comments — 157 блог поста изгубиха TL;DR секциите за една нощ.",
        wouldDoDifferently:
          "Бизнес маркери винаги структурни (div с data-marker атрибут), никога семантични (коментари). Sanitizers имат различни дефолти — коментарите са 'метаданни', не съдържание.",
      },
      {
        title: "Gemini thinking models хабят tokens без да има value",
        detail:
          "gemini-2.5-flash се marketираше като cheap model, но е thinking model — харчи токени за вътрешно reasoning което потребителят не вижда. На дневен хороскоп (8-параграф output) реалният output беше 800 токена, но internal reasoning харчеше допълнително 2000. Бюджетът изгаряше за дни.",
        wouldDoDifferently:
          "Тестваме input/output ratio на всеки нов model ПРЕДИ да го пуснем в production. Сменен навсякъде с gemini-3.1-flash-lite (non-thinking) — разходите паднаха 60% при еднакво качество за кратките BG outputs.",
      },
      {
        title: "Webhook идемпотентен design не е optional",
        detail:
          "Първата версия на Stripe webhook-а проверяваше само stripe_event_id = processed flag. Когато event failure не set-ваше processed=false, retry-ите блокираха завинаги. Клиент плати subscription но не получи access 26 дни — сериозна доверителна загуба.",
        wouldDoDifferently:
          "Нов design: processing_started_at timestamp + staleness check. Event older than 5 min без processed=true се приема за stuck и reprocess-ва. Never trust HTTP 200 alone; second-source recovery (checkout.session.completed → customer lookup) като безопасен backstop.",
      },
      {
        title: "Tailwind v4 + PostCSS + PWA interaction",
        detail:
          "Миграцията към Tailwind v4 + Next.js 16 + Turbopack разкри, че next-pwa service worker кешира старите CSS chunk-ове при HMR. Потребителите виждаха старите стилове 2 секунди при hard refresh.",
        wouldDoDifferently:
          "Конфигурирахме buildExcludes за app-build-manifest + reloadOnOnline: true в next-pwa config. Също disable: dev mode за да не interfere с Turbopack HMR.",
      },
    ],
    codeHighlights: [
      {
        title: "Stripe period fields helper (version-safe)",
        why:
          "Stripe 2025-09-30.clover API премести current_period_start/end от subscription root в items. Retry-и replay-ват стари events с root shape. Без helper, всяко директно четене е footgun.",
        snippet: `// Single source of truth for Stripe period fields.
// Handles both pre-clover (root) and post-clover (item) shapes.
export function getSubscriptionPeriod(
  sub: Stripe.Subscription
): { start: number; end: number } {
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number;
        current_period_end?: number;
      })
    | undefined;
  const rootLike = sub as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  };
  const start = item?.current_period_start ?? rootLike.current_period_start;
  const end = item?.current_period_end ?? rootLike.current_period_end;
  if (typeof start !== 'number' || typeof end !== 'number') {
    throw new Error(\`Subscription \${sub.id} missing current_period fields\`);
  }
  return { start, end };
}`,
        filePath: "lib/stripe/get-subscription-period.ts",
      },
      {
        title: "Workflow DevKit — durable per-sign horoscope generation",
        why:
          "48+ AI calls за понеделник сутрешния крон прехвърляше 60s serverless timeout. Durable steps позволяват всяка зодия да retry независимо.",
        snippet: `'use workflow';

import { generateForSign } from './generate-for-sign';
import { getDailyEphemeris } from '@/lib/astrology/ephemeris-astronomy-engine';

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export async function generateHoroscopesWorkflow() {
  const now = new Date();
  const languages: Array<'bg' | 'en'> = ['bg', 'en'];
  const periods = ['daily'];
  if (now.getDay() === 1) periods.push('weekly');
  if (now.getDate() === 1) periods.push('monthly');

  const ephemeris = getDailyEphemeris(now);

  for (const period of periods) {
    for (const sign of ZODIAC_SIGNS) {
      // Each call is a durable step. Retries independently.
      await generateForSign({ sign, period, languages, ephemeris });
    }
  }
}`,
        filePath: "workflows/horoscope-generation/index.ts",
      },
      {
        title: "DB-backed redirects с in-memory cache",
        why:
          "60+ static redirects в next.config.js + админ може да добавя dynamic в DB. Middleware хит без DB query на всеки request.",
        snippet: `// 5-min TTL cache; stale fallback on DB error (zero downtime).
let redirectsCache: Map<string, {
  destination: string;
  statusCode: number;
}> | null = null;
let redirectsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getRedirects() {
  const now = Date.now();
  if (redirectsCache && now - redirectsCacheTime < CACHE_TTL) {
    return redirectsCache;
  }
  try {
    const { data } = await supabase
      .from('redirects')
      .select('source_path, destination_path, status_code')
      .eq('is_active', true);
    const fresh = new Map();
    for (const r of data || []) {
      fresh.set(r.source_path, {
        destination: r.destination_path,
        statusCode: r.status_code,
      });
    }
    redirectsCache = fresh;
    redirectsCacheTime = now;
    return fresh;
  } catch {
    return redirectsCache || new Map(); // stale but not broken
  }
}`,
        filePath: "middleware.ts",
      },
      {
        title: "Feature → model mapping с декларативен fallback chain",
        why:
          "Различни features имат различни cost/quality constraints. Централизиран map позволява model migration с една редакция — никакви hardcoded model IDs в routes.",
        snippet: `// Declarative feature → [primary, fallback1, fallback2] chain.
// Route does callAI({ feature: 'synastry', ... }) — never sees model ID.
export const FEATURE_MODEL_MAP: Record<AIFeature, string[]> = {
  horoscope:       ['gemini_31_flash_lite', 'gemini_flash_lite', 'deepseek'],
  synastry:        ['gemini_31_pro',        'gemini_31_flash_lite', 'deepseek'],
  karmic_analysis: ['gemini_31_pro',        'gemini_31_flash_lite', 'deepseek'],
  blog_content:    ['gemini_31_pro',        'gemini_3_flash',       'gemini_31_flash_lite'],
  blog_images:     ['gemini_image'],
  // ... 14 more features
};`,
        filePath: "lib/ai/models.ts",
      },
    ],
  },
  {
    slug: "bacho-iliya",
    name: "Бачо Илия",
    tagline: "Лендинг страница за традиционни млечни продукти",
    heroImage: "/projects/bacho-iliya.webp",
    liveUrl: "https://www.bacho-iliya.eu/",
    category: "Лендинг",
    tags: ["Next.js", "Tailwind CSS", "Lead generation", "SEO"],
    primaryMetric: { value: "3x", label: "Повече запитвания" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "\"Бачо Илия\" е производител на традиционни млечни продукти с дългогодишна история. Компанията искаше да разшири дистрибуцията си и да привлече нови търговски партньори чрез онлайн кампания с безплатна дегустация.",
        "Съществуващото им онлайн присъствие беше минимално — нямаха уебсайт и разчитаха единствено на традиционни канали за продажби.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Създадохме ефектна лендинг страница, фокусирана върху една цел — генериране на заявки за безплатна дегустация. Дизайнът подчертава автентичността на продуктите и традицията зад марката.",
        "Страницата включва убедително представяне на продуктовата гама, социално доказателство и ясен call-to-action. Оптимизирахме я за скорост и мобилни устройства.",
      ],
      features: [
        "Конверсионно оптимизирана лендинг страница",
        "Кампания за безплатна дегустация с форма за заявка",
        "Продуктова галерия с визуално представяне",
        "Мобилна оптимизация за реклами от социални мрежи",
        "Бърза скорост на зареждане (под 2 секунди)",
        "Интеграция с имейл маркетинг за follow-up",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Analytics"],
    results: {
      title: "Резултати",
      description: "Лендинг страницата се превърна в основен инструмент за привличане на нови търговски партньори и потребители.",
      metrics: [
        { value: "3x", label: "Повече запитвания за дистрибуция" },
        { value: "8.5%", label: "Конверсия на лендинга" },
        { value: "1.8s", label: "Време за зареждане" },
        { value: "300+", label: "Заявки за дегустация" },
      ],
    },
    testimonialId: "bacho-iliya",
    duration: "2 седмици",
    year: "2024",
    metaTitle: "Бачо Илия — Case Study | ЛЕВЕЛ 8",
    metaDescription: "Как лендинг страница за безплатна дегустация утрои запитванията за традиционни млечни продукти на Бачо Илия.",
  },
  {
    slug: "hot22",
    name: "HOT22",
    tagline: "Сайт за автосервиз за климатици с онлайн резервации",
    heroImage: "/projects/hot22.webp",
    liveUrl: "https://hot22.eu/",
    category: "Уебсайт",
    tags: ["Next.js", "Tailwind CSS", "Vercel", "i18n"],
    primaryMetric: { value: "5.0/5", label: "Google рейтинг (14 ревюта)" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "HOT22 е специализиран сервиз за автоклиматици във Варна. Бизнесът разчиташе изцяло на препоръки от уста на уста, без собствено онлайн присъствие.",
        "Целта беше сайт, който показва професионализъм, позволява онлайн резервации и привлича клиенти чрез органично търсене в Google.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Изградихме двуезичен (BG/EN) уебсайт с Next.js, фокусиран върху конверсии \u2014 ясни CTA бутони, онлайн система за запазване на час и интеграция с Google Reviews.",
        "Представихме 6 специализирани услуги с отделни страници, FAQ секция за SEO и директна връзка за обаждане и WhatsApp.",
      ],
      features: [
        "Онлайн система за запазване на час",
        "Двуезичен интерфейс (BG/EN)",
        "6 специализирани страници за услуги",
        "Интеграция с Google Reviews (5.0/5)",
        "WhatsApp и директно обаждане от мобилен",
        "FAQ секция за подобряване на SEO",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Maps"],
    results: {
      title: "Резултати",
      description: "Сайтът превърна локалния сервиз в дигитално присъствие с отлична репутация и онлайн резервации.",
      metrics: [
        { value: "5.0/5", label: "Google рейтинг" },
        { value: "14", label: "Google Reviews" },
        { value: "6", label: "Страници за услуги" },
        { value: "2", label: "Езика (BG/EN)" },
      ],
    },
    duration: "3 седмици",
    year: "2025",
    metaTitle: "HOT22 \u2014 Case Study | \u041B\u0415\u0412\u0415\u041B 8",
    metaDescription: "Как изградихме двуезичен сайт за HOT22 \u2014 автосервиз за климатици във Варна с онлайн резервации и 5.0/5 Google рейтинг.",
  },
  {
    slug: "profiline",
    name: "Profiline GM25",
    tagline: "B2B продуктов сайт с мултиезичен интерфейс и европейска дистрибуция",
    heroImage: "/projects/profiline.webp",
    liveUrl: "https://profilinegm25.eu/",
    category: "Уебсайт",
    tags: ["Next.js", "Tailwind CSS", "Supabase", "i18n", "Schema.org"],
    primaryMetric: { value: "7", label: "Европейски домейна" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "Profiline GM25 е професионална орбитална полираща машина (1200W, 25mm орбита), произведена в България. Продуктът се предлагаше без собствено онлайн присъствие.",
        "Целта беше B2B платформа, която привлича дистрибутори от цяла Европа, представя продукта на професионално ниво и поддържа множество езици.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Изградихме dark-theme B2B сайт с професионална студийна фотография, подробни спецификации, сравнителна таблица с конкурентите и форма за дистрибуторски запитвания.",
        "Сайтът поддържа 5 езика (BG, EN, DE, ES, NL) с отделни домейни за всеки пазар. Интеграция със Supabase за формите и GA4 с Consent Mode v2.",
      ],
      features: [
        "Мултиезичен интерфейс (5 езика, 7 домейна)",
        "Сравнителна таблица с Rupes, Flex, Griot's",
        "B2B форма за дистрибуторски запитвания",
        "Професионална продуктова галерия (9 снимки)",
        "FAQ секция и Schema.org структурирани данни",
        "Google Consent Mode v2 и GDPR compliant",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Supabase", "Vercel", "GA4"],
    results: {
      title: "Резултати",
      description: "Платформата позиционира Profiline GM25 като директен конкурент на Rupes и Flex в европейския пазар.",
      metrics: [
        { value: "7", label: "Европейски домейна" },
        { value: "5", label: "Поддържани езика" },
        { value: "100", label: "Google PageSpeed Score" },
        { value: "4+", label: "Дистрибуторски партньора" },
      ],
    },
    duration: "4 седмици",
    year: "2025",
    metaTitle: "Profiline GM25 \u2014 Case Study | \u041B\u0415\u0412\u0415\u041B 8",
    metaDescription: "Как изградихме мултиезичен B2B сайт за Profiline GM25 с 7 европейски домейна и дистрибуторска мрежа.",
  },
  {
    slug: "ivanovi-am",
    name: "Иванови-АМ",
    tagline: "Корпоративен сайт за климатични системи Mitsubishi Electric",
    heroImage: "/projects/ivanovi-am.webp",
    liveUrl: "https://ivanovi-am.com/",
    category: "Уебсайт",
    tags: ["Next.js", "Tailwind CSS", "SEO", "Google Business"],
    primaryMetric: { value: "+45%", label: "Органичен трафик" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "Иванови-АМ е официален представител на Mitsubishi Electric за климатични системи в България. Компанията имаше остарял уебсайт, който не отразяваше техния професионализъм и не генерираше достатъчно онлайн запитвания.",
        "Конкуренцията в HVAC сектора е силна, а повечето клиенти започват търсенето си онлайн. Без модерно присъствие, компанията губеше пазарен дял.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Създадохме корпоративен уебсайт, който позиционира Иванови-АМ като водещ експерт в климатичните системи. Сайтът представя пълния каталог продукти, услуги по монтаж и сервиз.",
        "Инвестирахме значително в SEO стратегия — оптимизирано съдържание за всеки продуктов сегмент, локално SEO и техническа оптимизация за максимална скорост.",
      ],
      features: [
        "Каталог с продукти на Mitsubishi Electric",
        "Представяне на услуги — монтаж, сервиз, поддръжка",
        "SEO оптимизация за климатични системи",
        "Локално SEO за София и региона",
        "Контактни форми с автоматична маршрутизация",
        "Google Business интеграция",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Analytics", "Google Business"],
    results: {
      title: "Резултати",
      description: "Новият сайт значително увеличи онлайн видимостта и генерира постоянен поток от квалифицирани запитвания.",
      metrics: [
        { value: "+45%", label: "Ръст на органичния трафик" },
        { value: "Стр. 1", label: "В Google за HVAC термини" },
        { value: "+60%", label: "Повече онлайн запитвания" },
        { value: "0.9s", label: "Време за зареждане (LCP)" },
      ],
    },
    testimonialId: "ivanovi",
    duration: "4 седмици",
    year: "2024",
    metaTitle: "Иванови-АМ — Case Study | ЛЕВЕЛ 8",
    metaDescription: "Как нов корпоративен сайт за Иванови-АМ (Mitsubishi Electric) увеличи органичния трафик с 45%.",
  },
  {
    slug: "your-moment",
    name: "Your Moment",
    tagline: "Портфолио сайт за сватбена фотография и видеография",
    heroImage: "/projects/your-moment.webp",
    liveUrl: "https://yourmoment.bg/",
    category: "Уебсайт",
    tags: ["Next.js", "Tailwind CSS", "Галерия", "SEO"],
    primaryMetric: { value: "+60%", label: "Повече запитвания" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "Your Moment е студио за сватбена фотография и видеография с впечатляващо портфолио, но без професионален уебсайт. Студиото разчиташе изцяло на социални мрежи и препоръки.",
        "Instagram и Facebook не позволяват пълноценно представяне на работата — ограничена категоризация, няма контактна форма и потенциалните клиенти се губеха в социалните мрежи.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Създадохме елегантен портфолио сайт, който поставя фотографията в центъра. Дизайнът е минималистичен и чист, за да не отвлича вниманието от визуалното съдържание.",
        "Галерията е оптимизирана за бързо зареждане с lazy loading и adaptive image sizing. Контактната форма е фокусирана — събира необходимата информация за запитване за сватбена дата.",
      ],
      features: [
        "Портфолио галерия с lightbox преглед",
        "Lazy loading и оптимизирани изображения (WebP)",
        "Контактна форма с избор на дата и тип събитие",
        "Responsive дизайн с фокус върху визуалното съдържание",
        "SEO оптимизация за сватбена фотография",
        "Интеграция с Google Analytics за конверсии",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Analytics"],
    results: {
      title: "Резултати",
      description: "Уебсайтът се превърна в основен канал за нови клиенти, допълвайки успешно социалните мрежи.",
      metrics: [
        { value: "+60%", label: "Повече запитвания" },
        { value: "3.5 мин", label: "Средно време на сесия" },
        { value: "85%", label: "Мобилен трафик" },
        { value: "1.1s", label: "Време за зареждане (LCP)" },
      ],
    },
    duration: "3 седмици",
    year: "2024",
    metaTitle: "Your Moment — Case Study | ЛЕВЕЛ 8",
    metaDescription: "Как портфолио уебсайт за сватбена фотография Your Moment увеличи запитванията с 60%.",
  },
  {
    slug: "exotic-flowers",
    name: "Exotic Flowers",
    tagline: "Уебсайт за градински център с онлайн каталог и поръчки",
    heroImage: "/projects/exotic-flowers.webp",
    liveUrl: "https://www.exoticflowers.bg/",
    category: "Уебсайт",
    tags: ["Next.js", "Tailwind CSS", "Е-търговия", "Каталог"],
    primaryMetric: { value: "4.9/5", label: "Google рейтинг" },
    challenge: {
      title: "Предизвикателството",
      paragraphs: [
        "Exotic Flowers е градински център с над 28 години история и множество физически локации. Въпреки дългогодишния опит и високата клиентска удовлетвореност, онлайн присъствието не отразяваше мащаба на бизнеса.",
        "Клиентите искаха да разглеждат наличните продукти онлайн, да поръчват цветя за доставка и да намират информация за различните локации.",
      ],
    },
    solution: {
      title: "Решението",
      paragraphs: [
        "Изградихме комплексен уебсайт, който обхваща всички аспекти на бизнеса — каталог с продукти, блог с полезни съвети за градинарство, представяне на услуги и локации, и система за онлайн поръчки.",
        "Дизайнът е свеж и природен, отразяващ естетиката на градинарството. Навигацията е интуитивна, позволявайки на потребителите лесно да намерят точно това, което търсят.",
      ],
      features: [
        "Продуктов каталог с категории и филтри",
        "Система за онлайн поръчки на цветя и растения",
        "Блог с професионални съвети за градинарство",
        "Представяне на всички локации с Google Maps",
        "Responsive дизайн за всички устройства",
        "SEO оптимизация за локално търсене",
      ],
    },
    techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Maps API", "Google Analytics"],
    results: {
      title: "Резултати",
      description: "Новият уебсайт обедини всички дигитални канали и предостави на клиентите удобен начин за взаимодействие с градинския център.",
      metrics: [
        { value: "4.9/5", label: "Google рейтинг (28+ години)" },
        { value: "+200%", label: "Ръст на онлайн поръчки" },
        { value: "2 000+", label: "Продукта в каталога" },
        { value: "45%", label: "Трафик от блог съдържание" },
      ],
    },
    duration: "5 седмици",
    year: "2024",
    metaTitle: "Exotic Flowers — Case Study | ЛЕВЕЛ 8",
    metaDescription: "Как изградихме комплексен уебсайт с онлайн каталог и поръчки за Exotic Flowers — градински център с 28+ години история.",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

export function getAllCaseStudySlugs(): string[] {
  return CASE_STUDIES.map((cs) => cs.slug);
}

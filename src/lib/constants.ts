import type { NavItem, ServiceCard, PricingTier, PainPoint, ProjectCard } from "@/types";
import { TrendingDown, Hourglass, UserX, ShoppingCart, Zap, BotMessageSquare, Gem, AlertTriangle, CircleAlert } from "lucide-react";

export const NAV_ITEMS: NavItem[] = [
  { label: "Начало", href: "#hero" },
  { label: "Услуги", href: "#services" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "Цени", href: "#pricing" },
  { label: "За нас", href: "#about" },
  { label: "Контакти", href: "#contact" },
];

export const HERO = {
  badge: "DIGITAL EVOLUTION",
  title: "LEVEL 8:",
  titleLine2: "Бъдещето на",
  titleAccent: "Вашия Бизнес",
  subtitle:
    "Дигитална трансформация, AI автоматизация и е-търговия от следващо поколение. Ние създаваме решения, които работят за вас 24/7.",
  cta: "Започни сега",
  ctaSecondary: "Научи повече",
  stats: [
    { value: "50+", label: "Завършени проекта" },
    { value: "98%", label: "Доволни клиенти" },
  ],
};

export const PAIN_POINTS: PainPoint[] = [
  {
    icon: TrendingDown,
    title: "Губите клиенти онлайн",
    description:
      "Конкуренцията ви изпреварва с по-добри дигитални решения. Всеки ден без онлайн присъствие е пропуснат приход.",
    bottomLabel: "Загуба на клиенти",
    bottomIcon: TrendingDown,
  },
  {
    icon: Hourglass,
    title: "Тънете в ръчна работа",
    description:
      "Повтарящите се задачи ви крадат часове всеки ден. Вашият екип прави неща, които машина може да свърши за секунди.",
    bottomLabel: "Загуба на време",
    bottomIcon: AlertTriangle,
  },
  {
    icon: UserX,
    title: "Клиентите не се връщат",
    description:
      "Привличате нови клиенти, но те купуват веднъж и изчезват. Без система за лоялност, растежът буксува.",
    bottomLabel: "Технически дълг",
    bottomIcon: CircleAlert,
  },
];

export const PAIN_SECTION = {
  tag: "ПРОБЛЕМЪТ",
  title: "Усещате ли, че бизнесът ви",
  titleAccent: "боксува?",
  subtitle:
    "Много бизнеси се провалят в скалирането не заради липса на идеи, а заради остарели технологии, които задушават растежа.",
  solution: "Level 8 е решението.",
};

export const SERVICES: ServiceCard[] = [
  {
    id: "commerce",
    tag: "COMMERCE",
    title: "Онлайн магазин",
    description:
      "Модерен e-commerce с интуитивен дизайн, бързо зареждане и интеграция с платежни системи и куриери.",
    features: [
      "Responsive дизайн",
      "Платежни интеграции",
      "Куриерски услуги",
      "SEO оптимизация",
      "Админ панел",
    ],
    icon: ShoppingCart,
  },
  {
    id: "automate",
    tag: "AUTOMATE",
    title: "Автоматизация",
    description:
      "Свързваме системите ви и автоматизираме повтарящите се процеси — от фактури до инвентар и CRM.",
    features: [
      "Workflow автоматизация",
      "CRM интеграция",
      "Автоматични известия",
      "API интеграции",
      "Отчети и анализи",
    ],
    icon: Zap,
  },
  {
    id: "ai-agent",
    tag: "AI AGENT",
    title: "AI Чатбот",
    description:
      "Интелигентен асистент, който отговаря на клиентите ви 24/7, квалифицира leads и записва срещи.",
    features: [
      "24/7 наличност",
      "Естествен език (NLP)",
      "Lead квалификация",
      "Мултиезичност",
      "Аналитика",
    ],
    icon: BotMessageSquare,
  },
  {
    id: "loyalty",
    tag: "LOYALTY",
    title: "Програма за лоялност",
    description:
      "Дигитална система за точки, награди и персонализирани оферти, която превръща еднократните клиенти в редовни.",
    features: [
      "Точки и награди",
      "Персонални оферти",
      "Мобилно приложение",
      "Аналитика за клиенти",
      "Геймификация",
    ],
    icon: Gem,
  },
];

export const SERVICES_SECTION = {
  title: "Нашите Услуги",
  subtitle: "Комплексни решения за мащабиране на вашия бизнес в дигиталната ера.",
  viewAll: "Вижте всички услуги",
  learnMore: "НАУЧИ ПОВЕЧЕ",
};

export const PORTFOLIO_SECTION = {
  tag: "ПОРТФОЛИО",
  title: "Нашите",
  titleAccent: "Проекти",
  subtitle: "Реални решения, които вече работят за нашите клиенти.",
};

export const PORTFOLIO: ProjectCard[] = [
  {
    id: "euphoria-beauty",
    name: "Euphoria Beauty",
    url: "https://euphoriabeauty.eu/",
    image: "/projects/euphoria-beauty.png",
    description:
      "Сайт за козметичен салон с галерия, екип и онлайн резервации.",
    tags: ["Уебсайт", "Красота"],
  },
  {
    id: "vrachka",
    name: "Vrachka.eu",
    url: "https://www.vrachka.eu/",
    image: "/projects/vrachka.png",
    description:
      "AI астрология платформа с персонализирани хороскопи, таро и абонаментни планове.",
    tags: ["Уеб приложение", "AI"],
  },
  {
    id: "bacho-iliya",
    name: "Бачо Илия",
    url: "https://www.bacho-iliya.eu/",
    image: "/projects/bacho-iliya.png",
    description:
      "Маркетинг сайт за традиционни млечни продукти с кампания за безплатна дегустация.",
    tags: ["Лендинг", "Храни"],
  },
  {
    id: "profiline",
    name: "Profiline GM25",
    url: "https://profilinegm25.eu/",
    image: "/projects/profiline.png",
    description:
      "Продуктов сайт за професионална орбитална полираща машина.",
    tags: ["Лендинг", "Продукт"],
  },
  {
    id: "ivanovi-am",
    name: "Иванови-АМ",
    url: "https://ivanovi-am.com/",
    image: "/projects/ivanovi-am.png",
    description:
      "Корпоративен сайт за климатични системи — официален представител на Mitsubishi Electric.",
    tags: ["Уебсайт", "HVAC"],
  },
  {
    id: "hot22",
    name: "Hot22",
    url: "http://hot22.eu/",
    image: "/projects/hot22.png",
    description:
      "Сайт за автоклиматици и сервиз — в процес на разработка.",
    tags: ["Лендинг", "Авто"],
  },
  {
    id: "your-moment",
    name: "Your Moment",
    url: "https://yourmoment.bg/",
    image: "/projects/your-moment.png",
    description:
      "Портфолио сайт за сватбена фотография и видеография.",
    tags: ["Уебсайт", "Фотография"],
  },
];

export const PRICING: PricingTier[] = [
  {
    id: "startup",
    name: "STARTUP",
    price: "499",
    period: "еднократно",
    description: "Лендинг страница за стартиращ бизнес.",
    features: [
      "1 страница (лендинг)",
      "Responsive дизайн",
      "Контактна форма",
      "SEO основи",
      "SSL сертификат",
      "1 месец поддръжка",
    ],
    cta: "Стартирай",
  },
  {
    id: "commerce",
    name: "COMMERCE",
    price: "1 290",
    period: "еднократно",
    description: "Пълен онлайн магазин, готов за продажби.",
    features: [
      "До 500 продукта",
      "Платежен шлюз",
      "Куриерска интеграция",
      "Админ панел",
      "SEO оптимизация",
      "3 месеца поддръжка",
    ],
    highlighted: true,
    badge: "Популярен",
    cta: "Избери Commerce",
  },
  {
    id: "ai-bot",
    name: "AI BOT",
    price: "249",
    period: "/ месец",
    description: "AI чатбот за вашия сайт или социални мрежи.",
    features: [
      "Персонализиран AI агент",
      "Обучение с ваши данни",
      "24/7 поддръжка на клиенти",
      "Lead събиране",
      "Месечни отчети",
      "Мултиезичност",
    ],
    cta: "Активирай AI",
  },
  {
    id: "loyalty",
    name: "LOYALTY",
    price: "199",
    period: "/ месец",
    description: "Дигитална програма за лоялност.",
    features: [
      "Система за точки",
      "Персонални оферти",
      "Push известия",
      "Клиентска аналитика",
      "Брандиран интерфейс",
      "API достъп",
    ],
    cta: "Стартирай Loyalty",
  },
  {
    id: "custom",
    name: "CUSTOM 8",
    price: "По запитване",
    period: "",
    description: "Индивидуално решение, изградено по ваша мярка.",
    features: [
      "Всичко от горните пакети",
      "Персонална архитектура",
      "Приоритетна поддръжка",
      "Dedicated екип",
      "SLA гаранция",
      "Неограничени ревизии",
    ],
    badge: "Premium",
    cta: "Свържете се",
  },
];

export const PRICING_SECTION = {
  tag: "ПРОЗРАЧНОСТ И КАЧЕСТВО",
  title: "ИЗБЕРЕТЕ СВОЯ",
  titleAccent: "ПЛАН",
  subtitle: "Решения за всеки етап от развитието на вашия бизнес. От стартъп до корпоративна империя.",
  unsure: {
    title: "Не сте сигурни кой план е за вас?",
    subtitle: "Свържете се с нашия екип за безплатна консултация. Ще анализираме вашите нужди и ще изготвим персонализирана оферта за вашия бизнес.",
    cta: "ЗАЯВИ КОНСУЛТАЦИЯ",
  },
};

export const LEAD_MAGNET = {
  title: "Безплатен дигитален одит",
  subtitle:
    "Изпратете ни вашия имейл и ще получите персонализиран анализ на дигиталното присъствие на вашия бизнес — напълно безплатно.",
  cta: "Искам безплатен одит",
  placeholder: "вашият@имейл.бг",
  success: "Благодарим! Ще получите одита до 24 часа.",
};

export const ABOUT = {
  title: "За ЛЕВЕЛ 8",
  story: [
    "ЛЕВЕЛ 8 е дигитална агенция, базирана в България, специализирана в създаването на технологични решения, които реално помагат на бизнеса да расте.",
    "Вярваме, че технологията трябва да работи за вас, а не обратното. Затова изграждаме решения, които са прости за използване, но мощни под капака.",
    "От стартиращи бизнеси до утвърдени компании — ние сме партньорът, който довежда идеите до осмо ниво.",
  ],
};

export const CONTACT_SECTION = {
  title: "Свържете се с нас",
  subtitle: "Имате проект на ум? Разкажете ни повече и ние ще се свържем с вас.",
  form: {
    name: "Вашето име",
    phone: "Телефон",
    website: "Уебсайт (незадължително)",
    message: "Разкажете ни за вашия проект",
    submit: "Изпратете запитване",
    success: "Благодарим! Ще се свържем с вас до 24 часа.",
  },
};

export const GDPR = {
  consentLabel: "Съгласявам се с",
  consentLink: "Политиката за поверителност",
  consentError: "Трябва да приемете политиката за поверителност.",
};

export const A11Y = {
  skipNav: "Премини към основното съдържание",
  chatDialogLabel: "Чат с Level 8",
};

export const TECH_STACK = {
  label: "TECHNOLOGIES WE USE",
  items: [
    { name: "React", icon: "Code2" },
    { name: "Next.js", icon: "Layers" },
    { name: "TypeScript", icon: "FileCode2" },
    { name: "Node.js", icon: "Braces" },
    { name: "PostgreSQL", icon: "Database" },
    { name: "Supabase", icon: "Shield" },
    { name: "AWS", icon: "Cloud" },
    { name: "Vercel", icon: "Server" },
    { name: "Flutter", icon: "Smartphone" },
    { name: "Tailwind CSS", icon: "Wind" },
    { name: "OpenAI", icon: "Brain" },
    { name: "Stripe", icon: "CreditCard" },
    { name: "Docker", icon: "Container" },
    { name: "Redis", icon: "Zap" },
  ] as const,
};

export const FOOTER = {
  company: "ЛЕВЕЛ 8 ЕООД",
  tagline: "Дигитални решения за вашия бизнес",
  email: "info@level8.bg",
  phone: "+359 88 888 8888",
  address: "България",
  copyright: `© ${new Date().getFullYear()} ЛЕВЕЛ 8 ЕООД. Всички права запазени.`,
  privacyLabel: "Политика за поверителност",
  privacyUrl: "/privacy",
};

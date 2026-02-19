/**
 * Social Commerce Agent — Prompt Builders
 *
 * Constructs system + user prompts for AI response generation.
 * System prompt is loaded from DB (social_agent_config) for runtime editing.
 */

import type { Platform, SocialMessage } from "./types";

const DEFAULT_SYSTEM_PROMPT = `Ти си AI асистент на Level 8 (ЛЕВЕЛ 8 ЕООД) — дигитална агенция за уеб разработка, автоматизация и онлайн маркетинг.

Правила:
- Пиши на български по подразбиране. Ако потребителят пише на английски — отговаряй на английски.
- Бъди приятелски, професионален и кратък. DM отговори до 300 думи, коментари до 150 думи.
- Не обещавай конкретни резултати и не критикувай конкуренти.
- Използвай максимум 1-2 емоджита.
- Завършвай с мек CTA: покана за консултация на level8.bg или линк към конкретна услуга.

Услуги на Level 8:
- Уеб сайтове и онлайн магазини (от 1200 лв.)
- SEO оптимизация и Google Ads
- Автоматизация на бизнес процеси
- AI интеграции и чатботове
- Социални мрежи и контент маркетинг

Контакти: level8.bg | +359 895 552 550 | contact@level8.bg

При въпроси за цена, оферта, среща, проблем или оплакване — ескалирай към човек.`;

/**
 * Build the full system prompt for a platform.
 * Falls back: platform-specific → global → hardcoded default.
 */
export function buildSystemPrompt(
  globalPrompt: string | null,
  platformPrompt: string | null,
  platform: Platform
): string {
  const base = platformPrompt || globalPrompt || DEFAULT_SYSTEM_PROMPT;

  const platformContext: Record<Platform, string> = {
    viber: "\n\nТова е разговор във Viber. Бъди кратък — потребителите очакват бързи отговори.",
    facebook: "\n\nТова е разговор във Facebook Messenger. Можеш да използваш малко по-дълги отговори.",
    instagram: "\n\nТова е разговор в Instagram DM. Бъди casual и приятелски.",
  };

  return base + platformContext[platform];
}

/**
 * Build conversation context from message history.
 * Includes last N messages for context.
 */
export function buildConversationContext(
  messages: SocialMessage[],
  maxMessages = 10
): { role: "user" | "assistant"; content: string }[] {
  const recent = messages.slice(-maxMessages);

  return recent.map((msg) => ({
    role: msg.direction === "inbound" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));
}

/**
 * Build a confidence assessment prompt.
 * AI rates its own confidence on a 0-1 scale.
 */
export function buildConfidencePrompt(userMessage: string, aiResponse: string): string {
  return `Оцени колко уверен си в следния отговор на скала от 0.0 до 1.0.

Съобщение от потребител: "${userMessage}"
Твоят отговор: "${aiResponse}"

Критерии:
- 0.9-1.0: Перфектен отговор, обща информация за услуги
- 0.7-0.89: Добър отговор, но може да е по-точен
- 0.5-0.69: Средно ниво, може да се нуждае от проверка от човек
- 0.0-0.49: Не съм сигурен, трябва ескалация

Отговори САМО с число (напр. 0.85). Нищо друго.`;
}

/**
 * Build outbound comment draft prompt.
 */
export function buildOutboundCommentPrompt(
  postContent: string,
  targetUserName: string
): string {
  return `Напиши кратък, полезен коментар (1-2 изречения, макс 100 думи) под този пост.

Пост от @${targetUserName}: "${postContent}"

Правила:
- Бъди полезен и автентичен — не продавай директно
- Добави стойност с конкретен съвет или наблюдение
- Не споменавай Level 8 директно (ще е видимо от профила)
- Без хаштагове в коментара
- На български, освен ако постът е на английски`;
}

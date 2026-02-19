/**
 * Social Commerce Agent — AI Responder
 *
 * Generates AI responses via OpenRouter (reuses existing openrouter-client.ts).
 * Includes confidence self-assessment.
 */

import type { ContentEngineConfig } from "../content-engine/config";
import { complete } from "../content-engine/ai/openrouter-client";
import type { SocialMessage, AIResponse, Platform } from "./types";
import {
  buildSystemPrompt,
  buildConversationContext,
  buildConfidencePrompt,
} from "./prompts";
import { filterResponse, detectEscalation, parseConfidence } from "./guardrails";

interface GenerateOptions {
  platform: Platform;
  userMessage: string;
  conversationHistory: SocialMessage[];
  globalSystemPrompt: string | null;
  platformSystemPrompt: string | null;
  escalationKeywords?: string[];
  aiModel?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate an AI response for an inbound message.
 */
export async function generateResponse(
  config: ContentEngineConfig,
  options: GenerateOptions
): Promise<AIResponse> {
  const systemPrompt = buildSystemPrompt(
    options.globalSystemPrompt,
    options.platformSystemPrompt,
    options.platform
  );

  const conversationContext = buildConversationContext(options.conversationHistory);

  // Build messages array
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationContext,
    { role: "user" as const, content: options.userMessage },
  ];

  // Generate response
  const result = await complete(config, {
    model: options.aiModel || config.defaultTextModel,
    messages,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 500,
  });

  // Check guardrails on AI response
  const filterResult = filterResponse(result.content);
  if (filterResult) {
    return {
      content: result.content,
      model: result.model,
      confidence: 0,
      shouldEscalate: true,
      escalationReason: `Content filter: ${filterResult}`,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
    };
  }

  // Check escalation in user message
  const userEscalation = detectEscalation(
    options.userMessage,
    options.escalationKeywords
  );

  // Check escalation in AI response (shouldn't mention escalation triggers)
  const responseEscalation = detectEscalation(
    result.content,
    options.escalationKeywords
  );

  const shouldEscalate = userEscalation.shouldEscalate || responseEscalation.shouldEscalate;
  const escalationReason = userEscalation.reason || responseEscalation.reason;

  // Self-assess confidence
  let confidence = 0.8; // Default
  try {
    const confidenceResult = await complete(config, {
      model: options.aiModel || config.defaultTextModel,
      messages: [
        {
          role: "user",
          content: buildConfidencePrompt(options.userMessage, result.content),
        },
      ],
      temperature: 0,
      maxTokens: 10,
    });
    confidence = parseConfidence(confidenceResult.content);
  } catch {
    // If confidence check fails, use default
    console.warn("[AIResponder] Confidence check failed, using default 0.8");
  }

  return {
    content: result.content,
    model: result.model,
    confidence,
    shouldEscalate,
    escalationReason,
    promptTokens: result.usage.promptTokens,
    completionTokens: result.usage.completionTokens,
  };
}

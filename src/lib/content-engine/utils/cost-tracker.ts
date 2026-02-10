/**
 * AI Cost Tracker
 *
 * Tracks AI API usage costs. Uses DatabaseAdapter if available,
 * otherwise logs to console.
 */

import type { ContentEngineConfig } from '../config';
import type { AIUsageLog } from '../types';
import { getModelById } from '../config';

/**
 * Log an AI usage event with cost calculation.
 */
export async function logAIUsage(
  config: ContentEngineConfig,
  params: {
    feature: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    metadata?: Record<string, unknown>;
  }
): Promise<AIUsageLog> {
  const modelConfig = getModelById(params.model);

  const costUSD = modelConfig
    ? (params.promptTokens / 1_000_000) * modelConfig.costPer1M.input +
      (params.completionTokens / 1_000_000) * modelConfig.costPer1M.output
    : 0;

  const logEntry: AIUsageLog = {
    feature: params.feature,
    model: params.model,
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    costUSD,
    metadata: params.metadata,
    timestamp: new Date(),
  };

  // Save to database if adapter is available
  if (config.database) {
    try {
      await config.database.insert('ai_usage_logs', {
        feature: logEntry.feature,
        model: logEntry.model,
        prompt_tokens: logEntry.promptTokens,
        completion_tokens: logEntry.completionTokens,
        cost_usd: logEntry.costUSD,
        metadata: logEntry.metadata,
        created_at: logEntry.timestamp.toISOString(),
      });
    } catch (error) {
      config.logger?.warn('Failed to save AI usage log to database', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  config.logger?.info(
    `AI usage: ${params.feature} | ${params.model} | $${costUSD.toFixed(6)}`,
    { tokens: params.promptTokens + params.completionTokens }
  );

  return logEntry;
}

/**
 * Calculate cost for a given model and token counts.
 */
export function calculateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const model = getModelById(modelId);
  if (!model) return 0;

  return (
    (promptTokens / 1_000_000) * model.costPer1M.input +
    (completionTokens / 1_000_000) * model.costPer1M.output
  );
}

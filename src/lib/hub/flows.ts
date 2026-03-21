import { createClient } from "@supabase/supabase-js";
import type { HubFlowConfig, HubFlowDefinition } from "@/types/crm";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Check if a table INSERT is a trigger for any flow.
 */
export function findTriggerFlow(
  flowConfig: HubFlowConfig,
  tableName: string
): { flowName: string; flow: HubFlowDefinition } | null {
  for (const [name, flow] of Object.entries(flowConfig)) {
    if (flow.trigger_table === tableName) {
      return { flowName: name, flow };
    }
  }
  return null;
}

/**
 * Check if a table is expected/optional in any flow definition.
 * Returns all matching flows.
 */
export function findExpectedFlows(
  flowConfig: HubFlowConfig,
  tableName: string
): { flowName: string; flow: HubFlowDefinition; isOptional: boolean }[] {
  const matches: { flowName: string; flow: HubFlowDefinition; isOptional: boolean }[] = [];
  for (const [name, flow] of Object.entries(flowConfig)) {
    if (flow.expected_tables.includes(tableName)) {
      matches.push({ flowName: name, flow, isOptional: false });
    } else if (flow.optional_tables.includes(tableName)) {
      matches.push({ flowName: name, flow, isOptional: true });
    }
  }
  return matches;
}

/**
 * Create a new flow instance when a trigger event arrives.
 */
export async function createFlowInstance(
  websiteId: string,
  flowName: string,
  flow: HubFlowDefinition,
  correlationValue: string,
  triggerEventId: string
): Promise<string | null> {
  const db = getServiceClient();

  const steps: Record<string, string> = {};
  for (const t of flow.expected_tables) {
    steps[t] = t === flow.trigger_table ? "completed" : "pending";
  }
  for (const t of flow.optional_tables) {
    steps[t] = "pending";
  }

  const timeoutAt = new Date(Date.now() + flow.timeout_seconds * 1000).toISOString();

  const { data, error } = await db
    .from("hub_flow_instances")
    .insert({
      website_id: websiteId,
      flow_name: flowName,
      correlation_value: correlationValue,
      status: "pending",
      steps,
      timeout_at: timeoutAt,
    })
    .select("id")
    .single();

  if (error || !data) return null;

  await db
    .from("hub_events")
    .update({ flow_instance_id: data.id })
    .eq("id", triggerEventId);

  return data.id;
}

/**
 * Try to attach an event to an active flow instance.
 * Returns the flow_instance_id if matched, null if standalone.
 */
export async function attachToActiveFlow(
  websiteId: string,
  flowConfig: HubFlowConfig,
  tableName: string,
  record: Record<string, unknown> | null,
  eventId: string
): Promise<string | null> {
  if (!record) return null;

  const expectedFlows = findExpectedFlows(flowConfig, tableName);
  if (expectedFlows.length === 0) return null;

  const db = getServiceClient();

  for (const { flowName, flow } of expectedFlows) {
    const correlationValue = record[flow.correlation_field];
    if (!correlationValue) continue;

    const { data: instance } = await db
      .from("hub_flow_instances")
      .select("id, steps")
      .eq("website_id", websiteId)
      .eq("flow_name", flowName)
      .eq("correlation_value", String(correlationValue))
      .eq("status", "pending")
      .gt("timeout_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (instance) {
      const updatedSteps = { ...(instance.steps as Record<string, string>), [tableName]: "completed" };

      await db
        .from("hub_flow_instances")
        .update({ steps: updatedSteps })
        .eq("id", instance.id);

      await db
        .from("hub_events")
        .update({ flow_instance_id: instance.id })
        .eq("id", eventId);

      return instance.id;
    }
  }

  return null;
}

/**
 * Check if a table is part of any flow definition.
 */
export function isPartOfAnyFlow(
  flowConfig: HubFlowConfig,
  tableName: string
): boolean {
  for (const flow of Object.values(flowConfig)) {
    if (
      flow.trigger_table === tableName ||
      flow.expected_tables.includes(tableName) ||
      flow.optional_tables.includes(tableName)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluate a flow instance: determine final status and build notification message.
 */
export function evaluateFlow(
  flow: HubFlowDefinition,
  steps: Record<string, string>
): {
  status: "completed" | "partial";
  severity: "info" | "warning";
  statusLine: string;
} {
  let allExpectedDone = true;
  const parts: string[] = [];

  for (const t of flow.expected_tables) {
    if (steps[t] === "completed") {
      parts.push(`\u2705 ${t}`);
    } else {
      parts.push(`\u274C ${t}`);
      allExpectedDone = false;
    }
  }

  for (const t of flow.optional_tables) {
    if (steps[t] === "completed") {
      parts.push(`\u2705 ${t}`);
    }
  }

  return {
    status: allExpectedDone ? "completed" : "partial",
    severity: allExpectedDone ? "info" : "warning",
    statusLine: parts.join(" "),
  };
}

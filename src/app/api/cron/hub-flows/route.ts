import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/admin-notifications";
import { evaluateFlow } from "@/lib/hub/flows";
import type { HubFlowConfig, HubFlowDefinition } from "@/types/crm";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();

  // Find all timed-out, un-notified flow instances
  const { data: instances, error } = await db
    .from("hub_flow_instances")
    .select("*, crm_websites(id, domain, hub_flow_config, crm_clients(company_name))")
    .eq("notified", false)
    .lt("timeout_at", new Date().toISOString())
    .limit(50);

  if (error || !instances || instances.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;

  for (const instance of instances) {
    const website = instance.crm_websites as unknown as {
      id: string;
      domain: string;
      hub_flow_config: Record<string, unknown>;
      crm_clients: { company_name: string } | null;
    } | null;
    if (!website) continue;

    const flowConfig = (website.hub_flow_config || {}) as unknown as HubFlowConfig;
    const flowDef = flowConfig[instance.flow_name] as HubFlowDefinition | undefined;
    if (!flowDef) continue;

    const steps = instance.steps as Record<string, string>;
    const { status, severity, statusLine } = evaluateFlow(flowDef, steps);

    const clientName = website.crm_clients?.company_name || "\u2014";
    const emoji = status === "completed" ? "\u2705" : "\u26A0\uFE0F";

    const message = [
      `\uD83C\uDFE2 ${clientName}`,
      `\uD83C\uDF10 ${website.domain}`,
      `${emoji} ${flowDef.label} \u2014 ${instance.correlation_value}`,
      "",
      statusLine,
    ].join("\n");

    await createNotification({
      type: "hub_event",
      severity,
      title: `${emoji} ${flowDef.label} \u2014 ${website.domain}`,
      message,
      entityType: "website",
      entityId: website.id,
      actionUrl: `/admin/crm/websites/${website.id}`,
      sendTelegram: true,
      sendEmail: severity === "warning",
    });

    // Update flow instance
    await db
      .from("hub_flow_instances")
      .update({
        status,
        notified: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", instance.id);

    // Mark all events in this flow as notified
    await db
      .from("hub_events")
      .update({ notified: true })
      .eq("flow_instance_id", instance.id);

    processed++;
  }

  return NextResponse.json({ processed });
}

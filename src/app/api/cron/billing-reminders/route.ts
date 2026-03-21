import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBillingReminder } from "@/lib/admin-notifications";

/**
 * Daily cron: Check upcoming billing and send reminders.
 *
 * Timeline:
 * - 7 days before → Telegram info + Dashboard
 * - 3 days before → Telegram warning + Email + Dashboard
 * - 0 days (due)  → Telegram urgent + Email + Dashboard
 *
 * Vercel Cron: schedule "0 7 * * *" (7:00 AM UTC daily)
 */
export async function GET(request: Request) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const errors: string[] = [];
  let remindersCreated = 0;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const reminderDays = [0, 3, 7]; // days before billing date

    for (const daysBefore of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysBefore);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Find services with next_billing_date = targetDate
      const { data: services, error: svcError } = await supabase
        .from("crm_client_services")
        .select(
          "id, name, price, currency, billing_cycle, next_billing_date, crm_clients(id, company_name), crm_websites(domain)"
        )
        .eq("status", "active")
        .eq("next_billing_date", targetDateStr);

      if (svcError) {
        errors.push(`Service query error (${daysBefore}d): ${svcError.message}`);
        continue;
      }

      for (const svc of services ?? []) {
        const client = svc.crm_clients as unknown as {
          id: string;
          company_name: string;
        };
        const website = svc.crm_websites as unknown as {
          domain: string;
        } | null;

        // Check if invoice already exists for this period
        const { data: existingInvoice } = await supabase
          .from("crm_invoices")
          .select("id")
          .eq("service_id", svc.id)
          .eq("period_start", targetDateStr)
          .limit(1);

        if (existingInvoice && existingInvoice.length > 0) continue;

        try {
          await sendBillingReminder({
            serviceId: svc.id,
            clientName: client.company_name,
            serviceName: svc.name,
            domain: website?.domain || null,
            amount: Number(svc.price),
            currency: svc.currency || "EUR",
            dueDate: targetDateStr,
            daysUntil: daysBefore,
          });
          remindersCreated++;
        } catch (err) {
          errors.push(
            `Reminder error for ${client.company_name}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    // Log cron run
    await supabase.from("crm_cron_log").insert({
      run_type: "billing_reminders",
      invoices_generated: 0,
      invoices_marked_overdue: 0,
      notifications_sent: remindersCreated,
      errors: errors.length > 0 ? errors : null,
      duration_ms: Date.now() - start,
    });
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json({
    success: errors.length === 0,
    remindersCreated,
    errors,
    durationMs: Date.now() - start,
  });
}

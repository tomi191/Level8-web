import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  generateRecurringInvoicesCore,
  markOverdueInvoicesCore,
  sendOverdueNotificationsCore,
  processOverdueEscalationCore,
  processPendingRemindersCore,
  saveMrrSnapshot,
} from "@/lib/crm-billing";
import {
  sendOverdueNotification,
  sendOverdueEscalation,
  sendReminderNotification,
} from "@/lib/crm-emails";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this automatically)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const start = Date.now();

    // Use service role client (no cookie auth for cron)
    const db = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const allErrors: string[] = [];

    // Step 1: Generate recurring invoices
    const invoiceResult = await generateRecurringInvoicesCore(db);
    allErrors.push(...invoiceResult.errors);

    // Step 2: Mark overdue invoices
    const overdueCount = await markOverdueInvoicesCore(db);

    // Step 3: Send initial overdue notifications (for newly overdue invoices)
    const notifyResult = await sendOverdueNotificationsCore(db, sendOverdueNotification);
    allErrors.push(...notifyResult.errors);

    // Step 4: Process overdue escalation (3, 7, 14 days)
    const escalationResult = await processOverdueEscalationCore(db, sendOverdueEscalation);
    allErrors.push(...escalationResult.errors);

    // Step 5: Process pending reminders
    const reminderResult = await processPendingRemindersCore(db, sendReminderNotification);
    allErrors.push(...reminderResult.errors);

    // Step 6: Save MRR snapshot (upserts for current month)
    try {
      await saveMrrSnapshot(db);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      allErrors.push(`MRR snapshot: ${msg}`);
    }

    const durationMs = Date.now() - start;

    // Log to crm_cron_log
    await db.from("crm_cron_log").insert({
      run_type: "daily_recurring",
      invoices_generated: invoiceResult.generated,
      invoices_marked_overdue: overdueCount,
      notifications_sent:
        notifyResult.sent + escalationResult.sent + reminderResult.sent,
      errors: allErrors.length > 0 ? allErrors : null,
      duration_ms: durationMs,
    });

    return NextResponse.json({
      ok: true,
      generated: invoiceResult.generated,
      markedOverdue: overdueCount,
      notificationsSent: notifyResult.sent,
      escalationsSent: escalationResult.sent,
      remindersSent: reminderResult.sent,
      errors: allErrors,
      durationMs,
    });
  } catch (err) {
    console.error("Recurring cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

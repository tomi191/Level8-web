import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { InvoiceLineItem } from "@/types/crm";

type DbClient = SupabaseClient<Database>;

// ============================================================
// Helpers
// ============================================================

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function calculatePeriodEnd(start: Date, cycle: string): Date {
  const end = new Date(start);
  switch (cycle) {
    case "monthly":
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case "quarterly":
      end.setMonth(end.getMonth() + 3);
      end.setDate(end.getDate() - 1);
      break;
    case "yearly":
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
  }
  return end;
}

function calculateNextBillingDate(current: Date, cycle: string): Date {
  const next = new Date(current);
  switch (cycle) {
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "quarterly":
      next.setMonth(next.getMonth() + 3);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: "Месечна",
  quarterly: "Тримесечна",
  yearly: "Годишна",
};

// ============================================================
// Generate Recurring Invoices
// ============================================================

export async function generateRecurringInvoicesCore(db: DbClient): Promise<{
  generated: number;
  errors: string[];
}> {
  const today = toDateStr(new Date());
  const errors: string[] = [];
  let generated = 0;

  // Fetch active services with next_billing_date <= today
  const { data: services, error: fetchErr } = await db
    .from("crm_client_services")
    .select("*, crm_clients(id, company_name, email, billing_email)")
    .eq("status", "active")
    .eq("is_archived", false)
    .lte("next_billing_date", today);

  if (fetchErr) {
    errors.push(`Fetch services error: ${fetchErr.message}`);
    return { generated, errors };
  }

  if (!services || services.length === 0) {
    return { generated, errors };
  }

  for (const service of services) {
    try {
      const billingStart = new Date(service.next_billing_date!);
      const billingEnd = calculatePeriodEnd(billingStart, service.billing_cycle);
      const periodStartStr = toDateStr(billingStart);
      const periodEndStr = toDateStr(billingEnd);

      // Idempotency check: skip if invoice already exists for this period
      const { data: existing } = await db
        .from("crm_invoices")
        .select("id")
        .eq("service_id", service.id)
        .eq("period_start", periodStartStr)
        .eq("period_end", periodEndStr)
        .maybeSingle();

      if (existing) {
        // Already generated — advance next_billing_date if still stale
        const nextBilling = calculateNextBillingDate(billingStart, service.billing_cycle);
        await db
          .from("crm_client_services")
          .update({ next_billing_date: toDateStr(nextBilling) })
          .eq("id", service.id)
          .eq("next_billing_date", service.next_billing_date!); // optimistic lock
        continue;
      }

      // Optimistic lock: update next_billing_date FIRST to claim this service.
      // If another cron run already updated it, the WHERE won't match and
      // `updated` will be null — we skip to avoid duplicates.
      const nextBilling = calculateNextBillingDate(billingStart, service.billing_cycle);
      const { data: updated } = await db
        .from("crm_client_services")
        .update({ next_billing_date: toDateStr(nextBilling) })
        .eq("id", service.id)
        .eq("next_billing_date", service.next_billing_date!) // optimistic lock
        .select("id")
        .maybeSingle();

      if (!updated) {
        // Another cron run already processed this service
        continue;
      }

      // Get next invoice number
      const { data: invoiceNumber } = await db.rpc("crm_next_invoice_number");
      if (!invoiceNumber) {
        errors.push(`Failed to get invoice number for service ${service.id}`);
        // Rollback next_billing_date since we couldn't create the invoice
        await db
          .from("crm_client_services")
          .update({ next_billing_date: service.next_billing_date })
          .eq("id", service.id);
        continue;
      }

      const dueDate = addDays(billingStart, 15);

      const amount = round2(service.price);
      const vatAmount = round2(amount * 0.2);
      const totalAmount = round2(amount + vatAmount);

      const cycleName = CYCLE_LABELS[service.billing_cycle] || service.billing_cycle;

      const items: InvoiceLineItem[] = [
        {
          description: `${service.name} (${cycleName} ${periodStartStr} - ${periodEndStr})`,
          qty: 1,
          unit_price: amount,
          total: amount,
        },
      ];

      // Create invoice
      const { data: invoice, error: insertErr } = await db
        .from("crm_invoices")
        .insert({
          client_id: service.client_id,
          website_id: service.website_id,
          service_id: service.id,
          invoice_number: invoiceNumber as string,
          amount,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          currency: service.currency,
          service_type: service.service_type,
          description: `${service.name} - ${cycleName}`,
          is_recurring: true,
          recurring_interval: service.billing_cycle,
          period_start: periodStartStr,
          period_end: periodEndStr,
          status: "pending",
          due_date: toDateStr(dueDate),
          items: items as unknown as Json,
        })
        .select("id")
        .single();

      if (insertErr) {
        errors.push(`Insert invoice for service ${service.name}: ${insertErr.message}`);
        // Rollback next_billing_date since invoice creation failed
        await db
          .from("crm_client_services")
          .update({ next_billing_date: service.next_billing_date })
          .eq("id", service.id);
        continue;
      }

      // Log activity for invoice
      await db.from("crm_activity_log").insert({
        entity_type: "invoice",
        entity_id: invoice.id,
        action: "created",
        actor: "system/cron",
        description: `\u0410\u0432\u0442\u043E-\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0430\u043D\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430 ${invoiceNumber} \u0437\u0430 ${service.name}`,
      });

      // Log activity for service
      await db.from("crm_activity_log").insert({
        entity_type: "service",
        entity_id: service.id,
        action: "updated",
        actor: "system/cron",
        description: `\u0421\u043B\u0435\u0434\u0432\u0430\u0449\u043E \u0444\u0430\u043A\u0442\u0443\u0440\u0438\u0440\u0430\u043D\u0435: ${toDateStr(nextBilling)}`,
      });

      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Service ${service.name}: ${msg}`);
    }
  }

  return { generated, errors };
}

// ============================================================
// Mark Overdue Invoices
// ============================================================

export async function markOverdueInvoicesCore(db: DbClient): Promise<number> {
  const { data } = await db.rpc("crm_auto_mark_overdue");
  const rpcCount = (data as number) ?? 0;

  // Also mark "sent" invoices as overdue (the SQL function may only handle "pending")
  const today = toDateStr(new Date());
  const { data: sentOverdue } = await db
    .from("crm_invoices")
    .update({ status: "overdue" })
    .eq("status", "sent")
    .lt("due_date", today)
    .eq("is_archived", false)
    .select("id");

  const sentCount = sentOverdue?.length ?? 0;
  return rpcCount + sentCount;
}

// ============================================================
// Send Overdue Notifications
// ============================================================

export async function sendOverdueNotificationsCore(
  db: DbClient,
  sendEmailFn: (params: {
    clientEmail: string;
    clientName: string;
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    daysOverdue: number;
  }) => Promise<void>
): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;

  const today = new Date();

  // Fetch overdue invoices that haven't been notified
  const { data: invoices } = await db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name, email, billing_email)")
    .eq("status", "overdue")
    .eq("notification_sent", false)
    .eq("is_archived", false);

  if (!invoices || invoices.length === 0) {
    return { sent, errors };
  }

  for (const inv of invoices) {
    try {
      const client = inv.crm_clients as unknown as {
        id: string;
        company_name: string;
        email: string | null;
        billing_email: string | null;
      };

      const email = client?.billing_email || client?.email;
      if (!email) {
        errors.push(`No email for client ${client?.company_name} (invoice ${inv.invoice_number})`);
        continue;
      }

      const daysOverdue = Math.floor(
        (today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      await sendEmailFn({
        clientEmail: email,
        clientName: client.company_name,
        invoiceNumber: inv.invoice_number,
        totalAmount: inv.total_amount,
        dueDate: inv.due_date,
        daysOverdue,
      });

      // Mark as notified
      await db
        .from("crm_invoices")
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq("id", inv.id);

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Invoice ${inv.invoice_number}: ${msg}`);
    }
  }

  return { sent, errors };
}

// ============================================================
// Overdue Escalation (3, 7, 14 days)
// ============================================================

export async function processOverdueEscalationCore(
  db: DbClient,
  sendEscalationFn: (params: {
    clientEmail: string;
    invoiceNumber: string;
    totalAmount: number;
    dueDate: string;
    daysOverdue: number;
    level: 1 | 2 | 3;
  }) => Promise<void>
): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;

  // Fetch all overdue, non-archived invoices with their clients
  const { data: overdueInvoices } = await db
    .from("crm_invoices")
    .select("*, crm_clients(id, company_name, email, billing_email)")
    .eq("status", "overdue")
    .eq("is_archived", false);

  if (!overdueInvoices || overdueInvoices.length === 0) {
    return { sent, errors };
  }

  const now = new Date();

  for (const invoice of overdueInvoices) {
    try {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine target escalation level based on days overdue
      let targetLevel: 0 | 1 | 2 | 3 = 0;
      if (daysOverdue >= 14) targetLevel = 3;
      else if (daysOverdue >= 7) targetLevel = 2;
      else if (daysOverdue >= 3) targetLevel = 1;

      // Skip if not yet at any escalation threshold
      if (targetLevel === 0) continue;

      // Skip if already sent this level or higher
      const currentLevel = invoice.reminder_count ?? 0;
      if (targetLevel <= currentLevel) continue;

      const client = invoice.crm_clients as unknown as {
        id: string;
        company_name: string;
        email: string | null;
        billing_email: string | null;
      };

      const email = client?.billing_email || client?.email;
      if (!email) {
        errors.push(
          `No email for client ${client?.company_name} (invoice ${invoice.invoice_number})`
        );
        continue;
      }

      await sendEscalationFn({
        clientEmail: email,
        invoiceNumber: invoice.invoice_number,
        totalAmount: invoice.total_amount,
        dueDate: invoice.due_date,
        daysOverdue,
        level: targetLevel,
      });

      // Update reminder_count and last_reminder_at
      await db
        .from("crm_invoices")
        .update({
          reminder_count: targetLevel,
          last_reminder_at: new Date().toISOString(),
        })
        .eq("id", invoice.id);

      // Log activity
      const levelLabels = {
        1: "\u041D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435 (3 \u0434\u043D\u0438)",
        2: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430 \u0444\u0430\u043A\u0442\u0443\u0440\u0430 (7 \u0434\u043D\u0438)",
        3: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u043E \u043D\u0430\u043F\u043E\u043C\u043D\u044F\u043D\u0435 (14 \u0434\u043D\u0438)",
      } as const;

      await db.from("crm_activity_log").insert({
        entity_type: "invoice",
        entity_id: invoice.id,
        action: "updated",
        actor: "system/cron",
        description: `${levelLabels[targetLevel]}: ${invoice.invoice_number} \u2192 ${email}`,
      });

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Escalation ${invoice.invoice_number}: ${msg}`);
    }
  }

  return { sent, errors };
}

// ============================================================
// Process Pending Reminders
// ============================================================

export async function processPendingRemindersCore(
  db: DbClient,
  sendNotificationFn: (params: {
    recipientEmail: string;
    title: string;
    description: string | null;
    dueDate: string;
    entityType: string;
    entityLabel: string;
  }) => Promise<void>
): Promise<{ sent: number; errors: string[] }> {
  const errors: string[] = [];
  let sent = 0;

  const now = new Date().toISOString();

  // Fetch pending reminders where remind_at <= now
  const { data: reminders } = await db
    .from("crm_reminders")
    .select("*")
    .eq("status", "pending")
    .lte("remind_at", now);

  if (!reminders || reminders.length === 0) {
    return { sent, errors };
  }

  for (const reminder of reminders) {
    try {
      // Resolve entity email based on entity_type
      let recipientEmail: string | null = null;
      let entityLabel = reminder.title;

      if (reminder.entity_type === "client") {
        const { data: client } = await db
          .from("crm_clients")
          .select("company_name, email, billing_email")
          .eq("id", reminder.entity_id)
          .single();
        if (client) {
          recipientEmail = client.billing_email || client.email;
          entityLabel = client.company_name;
        }
      } else if (reminder.entity_type === "invoice") {
        const { data: inv } = await db
          .from("crm_invoices")
          .select("invoice_number, crm_clients(email, billing_email, company_name)")
          .eq("id", reminder.entity_id)
          .single();
        if (inv) {
          const client = inv.crm_clients as unknown as {
            email: string | null;
            billing_email: string | null;
            company_name: string;
          };
          recipientEmail = client?.billing_email || client?.email;
          entityLabel = inv.invoice_number;
        }
      } else if (reminder.entity_type === "website") {
        const { data: website } = await db
          .from("crm_websites")
          .select("domain, contact_email, crm_clients(email, billing_email)")
          .eq("id", reminder.entity_id)
          .single();
        if (website) {
          const client = website.crm_clients as unknown as {
            email: string | null;
            billing_email: string | null;
          };
          recipientEmail =
            website.contact_email || client?.billing_email || client?.email;
          entityLabel = website.domain;
        }
      }

      // If no external email, send to admin instead
      const toEmail = recipientEmail || "contact@level8.bg";

      await sendNotificationFn({
        recipientEmail: toEmail,
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.due_date || reminder.remind_at || now,
        entityType: reminder.entity_type,
        entityLabel,
      });

      // Mark reminder as sent
      await db
        .from("crm_reminders")
        .update({ status: "sent" })
        .eq("id", reminder.id);

      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Reminder ${reminder.title}: ${msg}`);
    }
  }

  return { sent, errors };
}

// ============================================================
// MRR Snapshot (Task C)
// ============================================================

export async function saveMrrSnapshot(db: DbClient): Promise<void> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStr = toDateStr(monthStart);

  // Calculate current MRR from active services
  const { data: services } = await db
    .from("crm_client_services")
    .select("price, billing_cycle")
    .eq("status", "active")
    .eq("is_archived", false);

  let mrr = 0;
  let activeCount = 0;
  for (const s of services ?? []) {
    activeCount++;
    switch (s.billing_cycle) {
      case "monthly":
        mrr += Number(s.price);
        break;
      case "quarterly":
        mrr += Number(s.price) / 3;
        break;
      case "yearly":
        mrr += Number(s.price) / 12;
        break;
    }
  }

  mrr = round2(mrr);

  await db.from("crm_mrr_snapshots").upsert(
    { month: monthStr, mrr, active_services: activeCount },
    { onConflict: "month" }
  );
}

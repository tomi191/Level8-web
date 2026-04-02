import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendBillingReminder,
  createNotification,
} from "@/lib/admin-notifications";

/**
 * Daily cron: Check upcoming billing + domain/SSL expiry and send reminders.
 *
 * Billing timeline:
 * - 7 days before → Telegram info + Dashboard
 * - 3 days before → Telegram warning + Email + Dashboard
 * - 0 days (due)  → Telegram urgent + Email + Dashboard
 *
 * Domain/SSL:
 * - Uses crm_expiring_domains view (domains/SSL expiring within 60 days)
 * - Notifies at 30, 14, 7, 3, 0 days before expiry
 *
 * SSL auto-sync:
 * - Fetches SSL expiry from Cloudflare for sites with zone_id
 * - Updates ssl_expiry_date in crm_websites
 *
 * Vercel Cron: schedule "0 7 * * *" (7:00 AM UTC daily)
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const errors: string[] = [];
  let billingReminders = 0;
  let domainReminders = 0;
  let sslUpdated = 0;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();

    // ═══════════════════════════════════════════
    // PART 1: Billing Reminders
    // ═══════════════════════════════════════════
    const reminderDays = [0, 3, 7];

    for (const daysBefore of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysBefore);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      const { data: services, error: svcError } = await supabase
        .from("crm_client_services")
        .select(
          "id, name, price, currency, billing_cycle, next_billing_date, crm_clients(id, company_name), crm_websites(domain)"
        )
        .eq("status", "active")
        .eq("next_billing_date", targetDateStr);

      if (svcError) {
        errors.push(`Service query (${daysBefore}d): ${svcError.message}`);
        continue;
      }

      for (const svc of services ?? []) {
        const client = svc.crm_clients as unknown as { id: string; company_name: string };
        const website = svc.crm_websites as unknown as { domain: string } | null;

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
          billingReminders++;
        } catch (err) {
          errors.push(`Billing ${client.company_name}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    // ═══════════════════════════════════════════
    // PART 2: Domain & SSL Expiry Reminders
    // ═══════════════════════════════════════════
    const domainNotifyDays = [0, 3, 7, 14, 30];

    const { data: expiringDomains, error: domError } = await supabase
      .from("crm_expiring_domains")
      .select("*");

    if (domError) {
      errors.push(`Domain query: ${domError.message}`);
    }

    for (const dom of expiringDomains ?? []) {
      // Check domain expiry
      if (dom.domain_expiry_date) {
        const daysUntilDomain = Math.ceil(
          (new Date(dom.domain_expiry_date).getTime() - now.getTime()) / 86400000
        );

        if (domainNotifyDays.includes(daysUntilDomain) || daysUntilDomain < 0) {
          const severity =
            daysUntilDomain <= 0 ? "urgent" : daysUntilDomain <= 7 ? "warning" : "info";
          const daysText =
            daysUntilDomain <= 0
              ? "ИЗТЕКЪЛ!"
              : daysUntilDomain === 1
                ? "утре"
                : `след ${daysUntilDomain} дни`;

          try {
            await createNotification({
              type: "domain_expiry",
              severity: severity as "info" | "warning" | "urgent",
              title: `Домейн ${dom.domain} ${daysUntilDomain <= 0 ? "е изтекъл!" : `изтича ${daysText}`}`,
              message: [
                `\u{1F310} ${dom.domain}`,
                `\u{1F3E2} ${dom.company_name}`,
                `\u{1F4C5} ${dom.domain_expiry_date}`,
                dom.domain_registrar ? `\u{1F4DD} ${dom.domain_registrar}` : null,
                `\u{1F504} Auto-renew: ${dom.domain_auto_renew ? "\u0414\u0430" : "\u041D\u0415!"}`,
              ].filter(Boolean).join("\n"),
              entityType: "website",
              entityId: dom.id,
              actionUrl: `/admin/crm/websites/${dom.id}`,
              sendTelegram: true,
              sendEmail: severity !== "info",
            });
            domainReminders++;
          } catch (err) {
            errors.push(`Domain ${dom.domain}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }

      // Check SSL expiry
      if (dom.ssl_expiry_date) {
        const daysUntilSsl = Math.ceil(
          (new Date(dom.ssl_expiry_date).getTime() - now.getTime()) / 86400000
        );

        if (domainNotifyDays.includes(daysUntilSsl) || daysUntilSsl < 0) {
          const severity =
            daysUntilSsl <= 0 ? "urgent" : daysUntilSsl <= 7 ? "warning" : "info";
          const daysText =
            daysUntilSsl <= 0
              ? "ИЗТЕКЪЛ!"
              : daysUntilSsl === 1
                ? "утре"
                : `след ${daysUntilSsl} дни`;

          try {
            await createNotification({
              type: "ssl_expiry",
              severity: severity as "info" | "warning" | "urgent",
              title: `SSL за ${dom.domain} ${daysUntilSsl <= 0 ? "е изтекъл!" : `изтича ${daysText}`}`,
              message: [
                `\u{1F512} SSL сертификат`,
                `\u{1F310} ${dom.domain}`,
                `\u{1F3E2} ${dom.company_name}`,
                `\u{1F4C5} ${dom.ssl_expiry_date}`,
                dom.ssl_provider ? `\u{1F4DD} ${dom.ssl_provider}` : null,
              ].filter(Boolean).join("\n"),
              entityType: "website",
              entityId: dom.id,
              actionUrl: `/admin/crm/websites/${dom.id}`,
              sendTelegram: true,
              sendEmail: severity !== "info",
            });
            domainReminders++;
          } catch (err) {
            errors.push(`SSL ${dom.domain}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
    }

    // ═══════════════════════════════════════════
    // PART 3: Auto-sync SSL expiry from Cloudflare
    // ═══════════════════════════════════════════
    const cfToken = process.env.CLOUDFLARE_API_TOKEN;
    if (cfToken) {
      const { data: cfWebsites } = await supabase
        .from("crm_websites")
        .select("id, domain, cloudflare_zone_id, ssl_expiry_date")
        .eq("is_archived", false)
        .not("cloudflare_zone_id", "is", null);

      for (const site of cfWebsites ?? []) {
        try {
          const res = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${site.cloudflare_zone_id}/ssl/certificate_packs`,
            {
              headers: { Authorization: `Bearer ${cfToken}` },
            }
          );

          if (!res.ok) continue;

          const cfData = await res.json();
          const packs = cfData.result as Array<{
            certificates?: Array<{ expires_on?: string }>;
          }>;

          // Find the earliest SSL expiry from all cert packs
          let earliestExpiry: string | null = null;
          for (const pack of packs ?? []) {
            for (const cert of pack.certificates ?? []) {
              if (cert.expires_on) {
                const expiryDate = cert.expires_on.split("T")[0];
                if (!earliestExpiry || expiryDate < earliestExpiry) {
                  earliestExpiry = expiryDate;
                }
              }
            }
          }

          // Update if we found a new expiry date
          if (earliestExpiry && earliestExpiry !== site.ssl_expiry_date) {
            await supabase
              .from("crm_websites")
              .update({ ssl_expiry_date: earliestExpiry, ssl_status: "active" })
              .eq("id", site.id);
            sslUpdated++;
          }
        } catch {
          // Silent — CF API failure shouldn't block the cron
        }

        // Rate limit: 250ms between CF API calls
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    // ═══════════════════════════════════════════
    // Log cron run
    // ═══════════════════════════════════════════
    await supabase.from("crm_cron_log").insert({
      run_type: "billing_reminders",
      invoices_generated: sslUpdated,
      invoices_marked_overdue: 0,
      notifications_sent: billingReminders + domainReminders,
      errors: errors.length > 0 ? errors : null,
      duration_ms: Date.now() - start,
    });
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json({
    success: errors.length === 0,
    billingReminders,
    domainReminders,
    sslUpdated,
    errors,
    durationMs: Date.now() - start,
  });
}

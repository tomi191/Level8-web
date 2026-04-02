import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sendAdminDigest } from "@/lib/crm-emails";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch MRR (active services sum)
    const { data: mrrData } = await db
      .from("crm_client_services")
      .select("price, billing_cycle")
      .eq("status", "active")
      .eq("is_archived", false);

    let mrr = 0;
    for (const s of mrrData ?? []) {
      switch (s.billing_cycle) {
        case "monthly":
          mrr += s.price;
          break;
        case "quarterly":
          mrr += s.price / 3;
          break;
        case "yearly":
          mrr += s.price / 12;
          break;
      }
    }

    // Revenue this month (paid invoices)
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const { data: revenueData } = await db
      .from("crm_invoices")
      .select("total_amount")
      .eq("status", "paid")
      .gte("paid_date", monthStart);

    const revenueThisMonth = (revenueData ?? []).reduce(
      (sum, inv) => sum + inv.total_amount,
      0
    );

    // Overdue invoices
    const { data: overdueData } = await db
      .from("crm_invoices")
      .select("total_amount")
      .eq("status", "overdue")
      .eq("is_archived", false);

    const overdueCount = overdueData?.length ?? 0;
    const overdueAmount = (overdueData ?? []).reduce(
      (sum, inv) => sum + inv.total_amount,
      0
    );

    // Upcoming renewals (domains expiring in 30 days)
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const { data: renewals } = await db
      .from("crm_websites")
      .select("domain, domain_expiry_date")
      .eq("is_archived", false)
      .not("domain_expiry_date", "is", null)
      .lte("domain_expiry_date", in30Days.toISOString().split("T")[0]);

    // Invoices generated this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: generatedThisWeek } = await db
      .from("crm_invoices")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    await sendAdminDigest({
      mrr: Math.round(mrr * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      overdueCount,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      upcomingRenewals: renewals?.length ?? 0,
      generatedThisWeek: generatedThisWeek ?? 0,
    });

    return NextResponse.json({ ok: true, mrr, overdueCount, generatedThisWeek });
  } catch (err) {
    console.error("Digest cron error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

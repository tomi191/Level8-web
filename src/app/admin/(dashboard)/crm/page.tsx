import {
  getCrmDashboardStats,
  getExpiringDomains,
  getOverdueInvoices,
  getRecentActivity,
  getRevenueByClient,
  getUpcomingReminders,
  getUpcomingBilling,
  getMrrSnapshots,
  getBillingPipelineData,
} from "@/lib/crm-actions";
import { requireAdmin } from "@/lib/supabase/admin";
import { StatCard } from "@/components/admin/stat-card";
import { CrmOverdueAlert } from "@/components/admin/crm/crm-overdue-alert";
import { CrmDomainTimeline } from "@/components/admin/crm/crm-domain-timeline";
import { CrmActivityFeed } from "@/components/admin/crm/crm-activity-feed";
import { GenerateInvoicesButton } from "@/components/admin/crm/generate-invoices-button";
import { RevenueTable } from "@/components/admin/crm/revenue-table";
import { ReminderWidget } from "@/components/admin/crm/reminder-widget";
import { MrrChart } from "@/components/admin/crm/mrr-chart";
import { CrmUpcomingBilling } from "@/components/admin/crm/crm-upcoming-billing";
import { BillingPipeline } from "@/components/admin/crm/billing-pipeline";
import { HubOverview } from "@/components/admin/crm/hub-overview";
import { getHubOverview } from "@/lib/hub/actions";
import { Users, Globe, Banknote, ShieldAlert, Plus, Package, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function CrmDashboardPage() {
  await requireAdmin();

  const [stats, expiringDomains, overdueInvoices, recentActivity, revenueByClient, upcomingReminders, upcomingBilling, mrrSnapshots, billingPipeline, hubProjects] =
    await Promise.all([
      getCrmDashboardStats(),
      getExpiringDomains(),
      getOverdueInvoices(),
      getRecentActivity(15),
      getRevenueByClient(),
      getUpcomingReminders(),
      getUpcomingBilling(),
      getMrrSnapshots(12),
      getBillingPipelineData(),
      getHubOverview(),
    ]);

  const formattedRevenue = new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(stats.revenueThisMonth);

  const formattedMrr = new Intl.NumberFormat("bg-BG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(stats.mrr);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          Табло за управление
        </h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          label="Клиенти"
          value={stats.totalClients}
          icon={Users}
        />
        <StatCard
          label="Активни сайтове"
          value={stats.activeWebsites}
          icon={Globe}
          accent
        />
        <StatCard
          label="Активни услуги"
          value={stats.activeServices}
          icon={Package}
        />
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* MRR card */}
        <div className="rounded-2xl border border-neon/20 bg-surface p-5 md:p-6 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neon/60 tracking-wider uppercase">
              MRR
            </span>
            <TrendingUp size={18} className="text-neon/40" />
          </div>
          <span className="font-display text-3xl md:text-4xl font-bold block text-neon">
            {formattedMrr}
            <span className="text-lg text-neon/60 ml-1">€</span>
          </span>
          <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">
            Monthly Recurring Revenue
          </p>
        </div>

        {/* Revenue card */}
        <div className="rounded-2xl border border-border bg-surface p-5 md:p-6 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-muted-foreground/60 tracking-wider uppercase">
              Приходи (месец)
            </span>
            <Banknote size={18} className="text-muted-foreground/40" />
          </div>
          <span className="font-display text-3xl md:text-4xl font-bold block text-foreground">
            {formattedRevenue}
            <span className="text-lg text-muted-foreground ml-1">€</span>
          </span>
        </div>

        <StatCard
          label="Изтичащи домейни"
          value={stats.expiringDomains}
          icon={ShieldAlert}
          accent={stats.expiringDomains > 0}
        />
      </div>

      {/* Overdue invoices alert */}
      {overdueInvoices.length > 0 && (
        <CrmOverdueAlert invoices={overdueInvoices} />
      )}

      {/* Billing Pipeline — the main billing workflow */}
      <BillingPipeline data={billingPipeline} />

      {/* Hub Overview */}
      <HubOverview projects={hubProjects} />

      {/* Reminder widget */}
      <ReminderWidget reminders={upcomingReminders} />

      {/* Upcoming billing */}
      <CrmUpcomingBilling services={upcomingBilling} />

      {/* MRR Trend Chart */}
      <MrrChart snapshots={mrrSnapshots} />

      {/* Two column grid: Domain timeline + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrmDomainTimeline domains={expiringDomains} />
        <CrmActivityFeed activities={recentActivity} />
      </div>

      {/* Revenue per client */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // ПРИХОДИ ПО КЛИЕНТ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Приходи по клиент
          </h2>
        </div>
        <div className="p-0">
          <RevenueTable data={revenueByClient} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // БЪРЗИ ДЕЙСТВИЯ
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Създаване
          </h2>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          <Link
            href="/admin/crm/clients/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5",
              "px-4 py-2.5 text-sm font-medium text-neon",
              "hover:bg-neon/10 hover:border-neon/40 transition-colors"
            )}
          >
            <Plus size={16} />
            Нов клиент
          </Link>
          <Link
            href="/admin/crm/websites/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border",
              "px-4 py-2.5 text-sm font-medium text-foreground",
              "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
            )}
          >
            <Plus size={16} />
            Нов сайт
          </Link>
          <Link
            href="/admin/crm/invoices/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border",
              "px-4 py-2.5 text-sm font-medium text-foreground",
              "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
            )}
          >
            <Plus size={16} />
            Нова фактура
          </Link>
          <Link
            href="/admin/crm/services/new"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border",
              "px-4 py-2.5 text-sm font-medium text-foreground",
              "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
            )}
          >
            <Plus size={16} />
            Нова услуга
          </Link>
          <GenerateInvoicesButton />
        </div>
      </div>
    </div>
  );
}

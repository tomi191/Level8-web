"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Globe,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Calendar,
  Plus,
  Activity,
  Archive,
  Trash2,
  StickyNote,
  Package,
  Link2,
  Users,
  Clock,
  AlertTriangle,
  ExternalLink,
  Shield,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { markInvoicePaid } from "@/lib/crm-actions";
import type {
  CrmClient,
  CrmWebsite,
  CrmInvoice,
  CrmClientService,
  CrmActivityLog,
  CrmClientContact,
  ClientStatus,
  WebsiteStatus,
  InvoiceStatus,
  ServiceStatus,
  ActivityAction,
} from "@/types/crm";

interface ClientDetailProps {
  client: CrmClient;
  websites: CrmWebsite[];
  invoices: CrmInvoice[];
  services: CrmClientService[];
  activities: CrmActivityLog[];
}

// ── Status configs ──────────────────────────────────────────

const CLIENT_STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  active: {
    label: "Активен",
    dotClass: "bg-emerald-400",
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  inactive: {
    label: "Неактивен",
    dotClass: "bg-gray-400",
    badgeClass: "border-gray-500/20 bg-gray-500/10 text-gray-400",
  },
  paused: {
    label: "На пауза",
    dotClass: "bg-amber-400",
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  lead: {
    label: "Lead",
    dotClass: "bg-blue-400",
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
};

const WEBSITE_STATUS_CONFIG: Record<WebsiteStatus, { label: string; dotClass: string }> = {
  active: { label: "Активен", dotClass: "bg-emerald-400" },
  maintenance: { label: "Поддръжка", dotClass: "bg-amber-400" },
  development: { label: "В разработка", dotClass: "bg-blue-400" },
  archived: { label: "Архивиран", dotClass: "bg-gray-400" },
};

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: "Чернова", className: "border-gray-500/20 bg-gray-500/10 text-gray-400" },
  pending: { label: "Очаква плащане", className: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  sent: { label: "Изпратена", className: "border-blue-500/20 bg-blue-500/10 text-blue-400" },
  paid: { label: "Платена", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  overdue: { label: "Просрочена", className: "border-red-500/20 bg-red-500/10 text-red-400" },
  cancelled: { label: "Анулирана", className: "border-gray-500/20 bg-gray-500/10 text-gray-400" },
};

const SERVICE_STATUS_CONFIG: Record<ServiceStatus, { label: string; className: string }> = {
  active: { label: "Активна", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  paused: { label: "Паузирана", className: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  cancelled: { label: "Отказана", className: "border-red-500/20 bg-red-500/10 text-red-400" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Банков превод",
  card: "Карта",
  cash: "В брой",
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: "мес.",
  quarterly: "трим.",
  yearly: "год.",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  hosting: "Хостинг",
  maintenance: "Поддръжка",
  development: "Разработка",
  seo: "SEO",
  design: "Дизайн",
  other: "Друго",
};

const ACTION_ICON_MAP: Record<ActivityAction, { icon: typeof Plus; iconClass: string }> = {
  created: { icon: Plus, iconClass: "text-emerald-400 bg-emerald-500/10" },
  updated: { icon: Pencil, iconClass: "text-blue-400 bg-blue-500/10" },
  archived: { icon: Archive, iconClass: "text-amber-400 bg-amber-500/10" },
  deleted: { icon: Trash2, iconClass: "text-red-400 bg-red-500/10" },
  payment_received: { icon: CreditCard, iconClass: "text-neon bg-neon/10" },
  note_added: { icon: StickyNote, iconClass: "text-purple-400 bg-purple-500/10" },
  status_changed: { icon: StickyNote, iconClass: "text-blue-400 bg-blue-500/10" },
};

// ── Helpers ──────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Току-що";
  if (diffMin < 60) return `Преди ${diffMin} мин`;
  if (diffHr < 24) return `Преди ${diffHr} ${diffHr === 1 ? "час" : "часа"}`;
  if (diffDays < 7) return `Преди ${diffDays} ${diffDays === 1 ? "ден" : "дни"}`;

  return new Date(dateStr).toLocaleDateString("bg-BG", { day: "numeric", month: "short" });
}

function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " \u20ac"
  );
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function domainExpiryColor(days: number | null): string {
  if (days === null) return "text-muted-foreground/40";
  if (days <= 0) return "text-red-400";
  if (days <= 30) return "text-red-400";
  if (days <= 90) return "text-amber-400";
  return "text-emerald-400";
}

// ── Section wrapper ──────────────────────────────────────────

function Section({
  label,
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  label: string;
  title: string;
  icon?: typeof Globe;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface overflow-hidden", className)}>
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            {"// "}{label}
          </span>
          <h2 className="font-display text-base font-bold text-foreground mt-0.5 flex items-center gap-2">
            {Icon && <Icon size={15} className="text-muted-foreground/50" />}
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────

export function ClientDetail({
  client,
  websites,
  invoices,
  services,
  activities,
}: ClientDetailProps) {
  const [isPending, startTransition] = useTransition();
  const statusCfg = CLIENT_STATUS_CONFIG[client.status];
  const contacts = (client as CrmClient & { contacts?: CrmClientContact[] }).contacts ?? [];
  const portalToken = (client as CrmClient & { portal_token?: string }).portal_token;

  // ── KPI calculations ──
  const activeServices = services.filter((s) => s.status === "active");
  const clientMrr = activeServices.reduce((sum, s) => {
    switch (s.billing_cycle) {
      case "monthly": return sum + s.price;
      case "quarterly": return sum + s.price / 3;
      case "yearly": return sum + s.price / 12;
      default: return sum;
    }
  }, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalOwed = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue" || inv.status === "sent")
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length;

  const nearestExpiry = websites
    .map((w) => daysUntil(w.domain_expiry_date))
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b)[0] ?? null;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href="/admin/crm/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Всички клиенти
      </Link>

      {/* ── Header ── */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50">
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            {"// КЛИЕНТ"}
          </span>
        </div>

        <div className="p-5">
          {/* Row 1: Name + status + actions */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-xl md:text-2xl font-bold text-foreground break-words">
                  {client.company_name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0",
                    statusCfg.badgeClass
                  )}
                >
                  <span className={cn("block w-1.5 h-1.5 rounded-full", statusCfg.dotClass)} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Tags */}
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-neon/5 text-neon/60 border border-neon/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/admin/crm/clients/${client.id}/edit`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-neon/20 bg-neon/5",
                  "px-3 py-2 text-sm font-medium text-neon",
                  "hover:bg-neon/10 hover:border-neon/40 transition-colors"
                )}
              >
                <Pencil size={14} />
                Редактирай
              </Link>
              <Link
                href={`/admin/crm/invoices/new?client_id=${client.id}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-border",
                  "px-3 py-2 text-sm font-medium text-foreground",
                  "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
                )}
              >
                <FileText size={14} />
                Нова фактура
              </Link>
              <Link
                href={`/admin/crm/services/new?client_id=${client.id}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border border-border",
                  "px-3 py-2 text-sm font-medium text-foreground",
                  "hover:bg-white/[0.03] hover:border-border/80 transition-colors"
                )}
              >
                <Package size={14} />
                Нова услуга
              </Link>
              {portalToken && (
                <button
                  onClick={() => {
                    const portalUrl = `https://level8.bg/portal/${portalToken}`;
                    navigator.clipboard.writeText(portalUrl);
                    toast.success("Линкът е копиран", { description: portalUrl });
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5",
                    "px-3 py-2 text-sm font-medium text-purple-400",
                    "hover:bg-purple-500/10 hover:border-purple-500/40 transition-colors"
                  )}
                >
                  <Link2 size={14} />
                  Портал линк
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm mt-4 pt-4 border-t border-border/30">
            <InfoItem icon={Building2} label="ЕИК" value={client.eik} />
            <InfoItem icon={Mail} label="Email" value={client.email} href={client.email ? `mailto:${client.email}` : undefined} />
            <InfoItem icon={Phone} label="Телефон" value={client.phone} href={client.phone ? `tel:${client.phone}` : undefined} />
            <InfoItem icon={MapPin} label="Адрес" value={[client.address, client.city].filter(Boolean).join(", ") || null} />
            <InfoItem icon={CreditCard} label="Плащане" value={client.payment_method ? PAYMENT_METHOD_LABELS[client.payment_method] ?? client.payment_method : null} />
            <InfoItem icon={Calendar} label="Договор от" value={client.contract_start_date ? formatDate(client.contract_start_date) : null} />
            {client.billing_email && client.billing_email !== client.email && (
              <InfoItem icon={FileText} label="Фактури до" value={client.billing_email} />
            )}
            {client.contact_person && (
              <InfoItem icon={Users} label="Контакт" value={client.contact_person} />
            )}
          </div>

          {/* Row 3: Contacts */}
          {contacts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
                Контактни лица
              </span>
              <div className="flex flex-wrap gap-4 mt-2">
                {contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2 bg-white/[0.01]"
                  >
                    <span className="w-7 h-7 rounded-full bg-neon/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-neon">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </span>
                    <div className="text-sm">
                      <span className="text-foreground font-medium">{contact.name}</span>
                      {contact.role && (
                        <span className="text-muted-foreground/50 text-xs ml-2">{contact.role}</span>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/60 mt-0.5">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="hover:text-neon transition-colors">
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="hover:text-neon transition-colors">
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Домейни"
          value={String(websites.length)}
          sub={nearestExpiry !== null ? `${nearestExpiry <= 0 ? "Изтекъл!" : `${nearestExpiry} дни до изтичане`}` : undefined}
          subColor={domainExpiryColor(nearestExpiry)}
          icon={Globe}
        />
        <KpiCard
          label="MRR"
          value={formatCurrency(clientMrr)}
          sub={`${activeServices.length} активни услуги`}
          icon={Package}
        />
        <KpiCard
          label="Платено"
          value={formatCurrency(totalPaid)}
          sub={`${invoices.filter((i) => i.status === "paid").length} фактури`}
          icon={CreditCard}
        />
        <KpiCard
          label="Дължимо"
          value={formatCurrency(totalOwed)}
          sub={overdueCount > 0 ? `${overdueCount} просрочени!` : `${invoices.filter((i) => i.status === "pending" || i.status === "sent").length} чакащи`}
          subColor={overdueCount > 0 ? "text-red-400" : undefined}
          icon={FileText}
          valueColor={totalOwed > 0 ? "text-amber-400" : undefined}
        />
      </div>

      {/* ── Main grid: 2 columns on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Domains */}
          <Section
            label="ДОМЕЙНИ"
            title={`Домейни (${websites.length})`}
            icon={Globe}
            action={
              <Link
                href={`/admin/crm/websites/new?client_id=${client.id}`}
                className="text-xs text-neon/60 hover:text-neon transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                Добави
              </Link>
            }
          >
            {websites.length === 0 ? (
              <EmptyState text="Няма добавени домейни." />
            ) : (
              <div className="divide-y divide-border/20">
                {websites.map((site) => {
                  const days = daysUntil(site.domain_expiry_date);
                  const wsCfg = WEBSITE_STATUS_CONFIG[site.status] ?? { label: site.status, dotClass: "bg-gray-400" };

                  return (
                    <Link
                      key={site.id}
                      href={`/admin/crm/websites/${site.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {site.domain}
                          </span>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", wsCfg.dotClass)} />
                          <ExternalLink size={12} className="text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 mt-0.5">
                          {site.hosting_provider && <span>{site.hosting_provider}</span>}
                          {site.platform && <span className="capitalize">{site.platform}</span>}
                          {site.ssl_status === "active" && (
                            <span className="text-emerald-400/60 flex items-center gap-0.5">
                              <Shield size={10} />
                              SSL
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {site.domain_expiry_date ? (
                          <>
                            <span className={cn("text-xs font-mono", domainExpiryColor(days))}>
                              {days !== null && days <= 0 ? "Изтекъл!" : `${days} дни`}
                            </span>
                            <span className="text-[10px] text-muted-foreground/30 block">
                              {formatDate(site.domain_expiry_date)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30 italic">
                            Няма дата
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Services */}
          <Section
            label="УСЛУГИ"
            title={`Услуги (${services.length})`}
            icon={Package}
            action={
              <Link
                href={`/admin/crm/services/new?client_id=${client.id}`}
                className="text-xs text-neon/60 hover:text-neon transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                Добави
              </Link>
            }
          >
            {services.length === 0 ? (
              <EmptyState text="Няма добавени услуги." />
            ) : (
              <>
                {/* MRR bar */}
                <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border/20 text-xs">
                  <span className="text-muted-foreground/50">MRR:</span>
                  <span className="font-mono text-neon font-medium">{formatCurrency(clientMrr)}</span>
                </div>
                <div className="divide-y divide-border/20">
                  {services.map((svc) => {
                    const svcCfg = SERVICE_STATUS_CONFIG[svc.status] ?? { label: svc.status, className: "" };
                    const cycleLabel = BILLING_CYCLE_LABELS[svc.billing_cycle] ?? svc.billing_cycle;

                    return (
                      <Link
                        key={svc.id}
                        href={`/admin/crm/services/${svc.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {svc.name}
                            </span>
                            <Badge variant="outline" className={cn("text-[9px] font-mono shrink-0", svcCfg.className)}>
                              {svcCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 mt-0.5">
                            <span>{SERVICE_TYPE_LABELS[svc.service_type] ?? svc.service_type}</span>
                            {svc.next_billing_date && (
                              <span className="flex items-center gap-0.5">
                                <Clock size={10} />
                                {formatDate(svc.next_billing_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-mono text-foreground shrink-0">
                          {formatCurrency(svc.price)}/{cycleLabel}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </Section>

          {/* Notes */}
          <Section label="БЕЛЕЖКИ" title="Вътрешни бележки" icon={StickyNote}>
            <div className="p-5">
              {client.notes ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {client.notes}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/30 italic">
                  Няма въведени бележки. Добави от бутона &quot;Редактирай&quot;.
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Invoices / Financial */}
          <Section
            label="ФАКТУРИ"
            title={`Фактури (${invoices.length})`}
            icon={FileText}
            action={
              <Link
                href={`/admin/crm/invoices/new?client_id=${client.id}`}
                className="text-xs text-neon/60 hover:text-neon transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                Нова
              </Link>
            }
          >
            {invoices.length === 0 ? (
              <EmptyState text="Няма фактури." />
            ) : (
              <>
                {/* Summary bar */}
                <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border/20 text-xs">
                  <div>
                    <span className="text-muted-foreground/50">Платени: </span>
                    <span className="font-mono text-emerald-400">{formatCurrency(totalPaid)}</span>
                  </div>
                  {totalOwed > 0 && (
                    <div>
                      <span className="text-muted-foreground/50">Дължими: </span>
                      <span className="font-mono text-amber-400">{formatCurrency(totalOwed)}</span>
                    </div>
                  )}
                </div>
                <div className="divide-y divide-border/20">
                  {invoices.map((inv) => {
                    const invCfg = INVOICE_STATUS_CONFIG[inv.status as InvoiceStatus] ?? {
                      label: inv.status,
                      className: "border-gray-500/20 bg-gray-500/10 text-gray-400",
                    };
                    const canMarkPaid = inv.status === "pending" || inv.status === "sent" || inv.status === "overdue";

                    return (
                      <div
                        key={inv.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
                      >
                        <Link href={`/admin/crm/invoices/${inv.id}`} className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-medium text-foreground">
                              {inv.invoice_number}
                            </span>
                            <Badge variant="outline" className={cn("text-[9px] font-mono shrink-0", invCfg.className)}>
                              {invCfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50 mt-0.5">
                            {inv.description && <span className="truncate max-w-[180px]">{inv.description}</span>}
                            <span>Падеж: {formatDate(inv.due_date)}</span>
                          </div>
                        </Link>
                        <span className="text-sm font-mono text-foreground shrink-0">
                          {formatCurrency(inv.total_amount)}
                        </span>
                        {canMarkPaid && (
                          <button
                            disabled={isPending}
                            onClick={() => {
                              startTransition(async () => {
                                try {
                                  await markInvoicePaid(inv.id);
                                  toast.success(`${inv.invoice_number} маркирана като платена`);
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Грешка");
                                }
                              });
                            }}
                            title="Маркирай като платена"
                            className={cn(
                              "shrink-0 rounded-lg p-1.5 border transition-colors",
                              "border-emerald-500/20 bg-emerald-500/5 text-emerald-400/60",
                              "hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/40",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Section>

          {/* Activity Timeline */}
          <Section label="АКТИВНОСТ" title="Последна активност" icon={Activity}>
            {activities.length === 0 ? (
              <EmptyState text="Няма записана активност." />
            ) : (
              <div className="divide-y divide-border/20 max-h-[400px] overflow-y-auto">
                {activities.map((activity) => {
                  const config = ACTION_ICON_MAP[activity.action] ?? {
                    icon: Activity,
                    iconClass: "text-muted-foreground bg-muted-foreground/10",
                  };
                  const ActionIcon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className={cn("rounded-lg p-1.5 shrink-0 mt-0.5", config.iconClass)}>
                        <ActionIcon size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">
                          {activity.description || activity.action}
                        </p>
                        {activity.actor && (
                          <span className="text-[10px] text-muted-foreground/30 font-mono">
                            {activity.actor}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/40 shrink-0 mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────

function InfoItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Building2;
  label: string;
  value: string | null;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon size={13} className="text-muted-foreground/30 shrink-0" />
      <span className="text-[10px] text-muted-foreground/40 uppercase w-14 shrink-0">{label}</span>
      {value ? (
        href ? (
          <a href={href} className="hover:text-neon transition-colors truncate text-sm">
            {value}
          </a>
        ) : (
          <span className="text-sm text-foreground/80 truncate">{value}</span>
        )
      ) : (
        <span className="text-xs text-muted-foreground/25 italic">Няма данни</span>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  subColor,
  icon: Icon,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: typeof Globe;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} className="text-muted-foreground/30" />
        <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={cn("text-lg font-bold font-mono", valueColor || "text-foreground")}>{value}</p>
      {sub && (
        <p className={cn("text-[10px] mt-0.5", subColor || "text-muted-foreground/40")}>{sub}</p>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-6 text-center">
      <p className="text-xs text-muted-foreground/30 italic">{text}</p>
    </div>
  );
}

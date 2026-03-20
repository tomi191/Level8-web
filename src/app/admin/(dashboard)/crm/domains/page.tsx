import { requireAdmin } from "@/lib/supabase/admin";
import { getExpiringDomains, getCrmWebsites } from "@/lib/crm-actions";
import { DomainTracker } from "@/components/admin/crm/domain-tracker";

export default async function CrmDomainsPage() {
  await requireAdmin();

  const [expiringDomains, allWebsites] = await Promise.all([
    getExpiringDomains(),
    getCrmWebsites(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / ДОМЕЙНИ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          Домейни и SSL
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Преглед на домейни, SSL сертификати и хостинг подновявания
        </p>
      </div>

      {/* Domain tracker */}
      <DomainTracker domains={expiringDomains} allWebsites={allWebsites} />
    </div>
  );
}

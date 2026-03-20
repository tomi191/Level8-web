import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmServices } from "@/lib/crm-actions";
import { ServiceList } from "@/components/admin/crm/service-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function CrmServicesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status } = await searchParams;

  const services = await getCrmServices({
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // CRM / УСЛУГИ
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            Услуги
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {services.length} {services.length === 1 ? "услуга" : "услуги"} общо
          </p>
        </div>

        <Link
          href="/admin/crm/services/new"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5",
            "px-4 py-2.5 text-sm font-medium text-neon shrink-0",
            "hover:bg-neon/10 hover:border-neon/40 transition-colors"
          )}
        >
          <Plus size={16} />
          Нова услуга
        </Link>
      </div>

      <ServiceList services={services} />
    </div>
  );
}

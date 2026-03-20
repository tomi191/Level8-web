import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmWebsites } from "@/lib/crm-actions";
import { WebsiteList } from "@/components/admin/crm/website-list";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; platform?: string }>;
}

export default async function CrmWebsitesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, search } = await searchParams;

  const websites = await getCrmWebsites({
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // CRM / САЙТОВЕ
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            Сайтове
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {websites.length} {websites.length === 1 ? "сайт" : "сайта"} общо
          </p>
        </div>

        <Link
          href="/admin/crm/websites/new"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5",
            "px-4 py-2.5 text-sm font-medium text-neon shrink-0",
            "hover:bg-neon/10 hover:border-neon/40 transition-colors"
          )}
        >
          <Plus size={16} />
          Нов сайт
        </Link>
      </div>

      {/* Website list */}
      <WebsiteList websites={websites} />
    </div>
  );
}

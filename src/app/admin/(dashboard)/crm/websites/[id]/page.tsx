import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCrmWebsite,
  getWebsiteCfCache,
  getEntityActivity,
} from "@/lib/crm-actions";
import { getHubConnectionStatus } from "@/lib/hub/actions";
import { WebsiteDetail } from "@/components/admin/crm/website-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WebsiteDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [website, cfCache, activities, hubStatus] = await Promise.all([
    getCrmWebsite(id),
    getWebsiteCfCache(id),
    getEntityActivity("website", id),
    getHubConnectionStatus(id),
  ]);

  if (!website) {
    notFound();
  }

  return (
    <WebsiteDetail
      website={website}
      cfCache={cfCache}
      activities={activities}
      hubStatus={hubStatus}
    />
  );
}

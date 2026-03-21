import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getCrmWebsite,
  getWebsiteCfCache,
  getEntityActivity,
} from "@/lib/crm-actions";
import { getHubConnectionStatus, getHubEvents, getHubFlowInstances } from "@/lib/hub/actions";
import { WebsiteDetail } from "@/components/admin/crm/website-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WebsiteDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [website, cfCache, activities, hubStatus, hubEvents, hubFlowInstances] = await Promise.all([
    getCrmWebsite(id),
    getWebsiteCfCache(id),
    getEntityActivity("website", id),
    getHubConnectionStatus(id),
    getHubEvents(id, 50),
    getHubFlowInstances(id),
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
      hubEvents={hubEvents}
      hubFlowInstances={hubFlowInstances}
    />
  );
}

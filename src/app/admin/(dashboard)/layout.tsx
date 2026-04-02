export const maxDuration = 300;

import { requireAdmin } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { getCrmBadgeCounts } from "@/lib/crm-actions";
import {
  getUnreadNotifications,
  getUnreadCount,
} from "@/lib/admin-notifications";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  // Fetch CRM badge counts + notifications in parallel
  const [crmBadges, notifications, notificationCount] = await Promise.all([
    getCrmBadgeCounts().catch(() => ({
      overdueInvoices: 0,
      expiringDomains: 0,
    })),
    getUnreadNotifications(15).catch(() => []),
    getUnreadCount().catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar crmBadges={crmBadges} />
      <div className="md:ml-60">
        <AdminHeader
          userEmail={user.email || "admin"}
          notifications={notifications}
          notificationCount={notificationCount}
        />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

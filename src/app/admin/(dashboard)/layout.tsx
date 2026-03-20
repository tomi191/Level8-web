import { requireAdmin } from "@/lib/supabase/admin";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { getCrmBadgeCounts } from "@/lib/crm-actions";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  // Fetch CRM badge counts in parallel (cheap head-only queries)
  const crmBadges = await getCrmBadgeCounts().catch(() => ({
    overdueInvoices: 0,
    expiringDomains: 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar crmBadges={crmBadges} />
      <div className="md:ml-60">
        <AdminHeader userEmail={user.email || "admin"} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

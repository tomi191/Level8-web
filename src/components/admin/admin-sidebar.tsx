"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Bell,
  Settings,
  LogOut,
  MessageSquare,
  Briefcase,
  ChevronDown,
  Users,
  Globe,
  Receipt,
  Shield,
  BarChart3,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Заявки", icon: Inbox },
  { href: "/admin/blog", label: "Блог", icon: FileText },
  { href: "/admin/social", label: "Social Agent", icon: MessageSquare },
  { href: "/admin/subscribers", label: "Абонати", icon: Bell },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

type CrmBadges = {
  overdueInvoices: number;
  expiringDomains: number;
};

const CRM_LINKS: {
  href: string;
  label: string;
  icon: typeof BarChart3;
  badgeKey?: keyof CrmBadges;
}[] = [
  { href: "/admin/crm", label: "\u041E\u0431\u0437\u043E\u0440", icon: BarChart3 },
  { href: "/admin/crm/clients", label: "\u041A\u043B\u0438\u0435\u043D\u0442\u0438", icon: Users },
  { href: "/admin/crm/websites", label: "\u0421\u0430\u0439\u0442\u043E\u0432\u0435", icon: Globe },
  { href: "/admin/crm/contracts", label: "\u0414\u043E\u0433\u043E\u0432\u043E\u0440\u0438", icon: FileText },
  { href: "/admin/crm/invoices", label: "\u0424\u0430\u043A\u0442\u0443\u0440\u0438", icon: Receipt, badgeKey: "overdueInvoices" },
  { href: "/admin/crm/services", label: "\u0423\u0441\u043B\u0443\u0433\u0438", icon: Package },
  { href: "/admin/crm/domains", label: "\u0414\u043E\u043C\u0435\u0439\u043D\u0438", icon: Shield, badgeKey: "expiringDomains" },
];

export function AdminSidebar({
  crmBadges,
}: {
  crmBadges?: CrmBadges;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isCrmActive = pathname.startsWith("/admin/crm");
  const [crmOpen, setCrmOpen] = useState(isCrmActive);

  const crmTotalBadge =
    (crmBadges?.overdueInvoices ?? 0) + (crmBadges?.expiringDomains ?? 0);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-60 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border/50">
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          L8<span className="text-neon text-glow-neon"> ADMIN</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-neon bg-neon/10 border border-neon/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}

        {/* CRM Group */}
        <div className="pt-2">
          <button
            onClick={() => setCrmOpen(!crmOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
              isCrmActive
                ? "text-neon"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <Briefcase size={18} />
            <span className="flex-1 text-left">CRM</span>
            {!crmOpen && crmTotalBadge > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono min-w-[18px] h-[18px] px-1">
                {crmTotalBadge}
              </span>
            )}
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                crmOpen && "rotate-180"
              )}
            />
          </button>
          {crmOpen && (
            <div className="ml-3 pl-3 border-l border-border/30 space-y-0.5 mt-1">
              {CRM_LINKS.map((link) => {
                const isActive =
                  link.href === "/admin/crm"
                    ? pathname === "/admin/crm"
                    : pathname.startsWith(link.href);

                const badgeCount =
                  link.badgeKey && crmBadges
                    ? crmBadges[link.badgeKey]
                    : 0;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "text-neon bg-neon/10 border border-neon/20 font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <link.icon size={16} />
                    {link.label}
                    {badgeCount > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono min-w-[18px] h-[18px] px-1">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border/50">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
        >
          <LogOut size={18} />
          Изход
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Inbox, FileText, Bell, Settings, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Заявки", icon: Inbox },
  { href: "/admin/blog", label: "\u0411\u043B\u043E\u0433", icon: FileText },
  { href: "/admin/social", label: "Social Agent", icon: MessageSquare },
  { href: "/admin/subscribers", label: "\u0410\u0431\u043E\u043D\u0430\u0442\u0438", icon: Bell },
  { href: "/admin/settings", label: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
      <nav className="flex-1 px-3 py-4 space-y-1">
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

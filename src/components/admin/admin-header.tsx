"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Inbox,
  FileText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BREADCRUMBS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/submissions": "Заявки",
  "/admin/blog": "Блог",
  "/admin/settings": "Настройки",
};

const MOBILE_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Заявки", icon: Inbox },
  { href: "/admin/blog", label: "Блог", icon: FileText },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminHeader({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const breadcrumb = BREADCRUMBS[pathname] || "Admin";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-surface border-border w-60 p-0">
            <SheetTitle className="sr-only">Навигация</SheetTitle>
            <div className="flex items-center gap-2 px-6 h-16 border-b border-border/50">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                L8<span className="text-neon text-glow-neon"> ADMIN</span>
              </span>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {MOBILE_NAV.map((link) => {
                const isActive =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
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
          </SheetContent>
        </Sheet>

        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase">
            // КОНТРОЛЕН ПАНЕЛ
          </span>
          <h1 className="font-display text-lg font-bold text-foreground -mt-0.5">
            {breadcrumb}
          </h1>
        </div>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-neon/10 text-neon text-xs font-bold border border-neon/20">
                {userEmail.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[160px]">
              {userEmail}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-surface border-border">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
          >
            <LogOut size={14} className="mr-2" />
            Изход
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useScrollSpy();
  const pathname = usePathname();
  const isHashLink = (href: string) => href.startsWith("/#");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/90 backdrop-blur-xl border-b border-border shadow-[0_1px_0_oklch(0.85_0.27_142/0.15)]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 md:h-20">
        {/* Logo */}
        <a href="/#hero" className="flex items-center gap-2 group glitch-hover">
          <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-neon transition-colors">
            LEVEL<span className="text-neon text-glow-neon">8</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = isHashLink(item.href)
              ? activeSection === item.href.split("#")[1]
              : pathname.startsWith(item.href);
            const LinkOrA = isHashLink(item.href) ? "a" : Link;
            return (
              <LinkOrA
                key={item.href}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
                  isActive
                    ? "text-neon drop-shadow-[0_0_6px_oklch(0.85_0.27_142/0.5)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </LinkOrA>
            );
          })}
          <Button
            asChild
            className="ml-4 bg-neon text-primary-foreground hover:bg-neon/90 animate-glow-pulse font-semibold"
          >
            <a href="/#contact">Безплатна консултация</a>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Отвори менюто">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-surface border-border w-72">
            <SheetTitle className="sr-only">Навигационно меню</SheetTitle>
            <SheetDescription className="sr-only">Навигация за мобилни устройства</SheetDescription>
            <div className="flex flex-col gap-4 mt-8">
              {NAV_ITEMS.map((item) => {
                const isActive = isHashLink(item.href)
                  ? activeSection === item.href.split("#")[1]
                  : pathname.startsWith(item.href);
                const LinkOrA = isHashLink(item.href) ? "a" : Link;
                return (
                  <LinkOrA
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-neon bg-neon/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {item.label}
                  </LinkOrA>
                );
              })}
              <Button
                asChild
                className="mt-4 bg-neon text-primary-foreground hover:bg-neon/90 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                <a href="/#contact">Безплатна консултация</a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

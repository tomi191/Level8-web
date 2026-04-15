"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView, getSessionId } from "@/lib/session-tracking";

/**
 * Session Tracker — initializes session ID on mount and tracks page views.
 * Mount once in root layout.
 */
export function SessionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Ensure session ID exists
    getSessionId();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const full = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (lastPathRef.current === full) return;
    lastPathRef.current = full;

    // Slight delay to let title update
    const t = setTimeout(() => {
      trackPageView(full, document.title);
    }, 100);

    return () => clearTimeout(t);
  }, [pathname, searchParams]);

  return null;
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export function useScrollTrigger(onTrigger: () => void) {
  const hasTriggered = useRef(false);
  const [shouldNotify, setShouldNotify] = useState(false);

  const trigger = useCallback(() => {
    if (!hasTriggered.current) {
      hasTriggered.current = true;

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      if (isDesktop) {
        onTrigger();
      } else {
        setShouldNotify(true);
      }
    }
  }, [onTrigger]);

  useEffect(() => {
    // 5-second timer
    const timer = setTimeout(trigger, 5000);

    // 30% scroll
    const handleScroll = () => {
      const scrollPercentage =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercentage >= 0.3) {
        trigger();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [trigger]);

  return { shouldNotify };
}

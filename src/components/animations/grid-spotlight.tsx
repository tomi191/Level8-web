"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export function GridSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;
    const section = el.closest("section");
    if (!section) return;

    function onMove(e: MouseEvent) {
      const rect = section!.getBoundingClientRect();
      el!.style.setProperty("--x", `${e.clientX - rect.left}px`);
      el!.style.setProperty("--y", `${e.clientY - rect.top}px`);
      el!.style.opacity = "1";
    }

    function onLeave() {
      el!.style.opacity = "0";
    }

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0"
      style={{
        background:
          "radial-gradient(600px circle at var(--x) var(--y), oklch(0.85 0.27 142 / 0.07), transparent 40%)",
      }}
    />
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  as?: "span" | "p" | "h3";
}

export function DecryptedText({
  text,
  className,
  speed = 50,
  as: Tag = "span",
}: DecryptedTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const decrypt = useCallback(() => {
    if (prefersReducedMotion.current) return;

    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayed(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration) return text[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration += 1 / 2;
      if (iteration >= text.length) {
        setDisplayed(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, speed);
  }, [text, speed]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed(text);
  }, [text]);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return (
    <Tag
      className={cn("inline-block", className)}
      onMouseEnter={() => {
        setIsHovering(true);
        decrypt();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        reset();
      }}
    >
      {displayed}
    </Tag>
  );
}

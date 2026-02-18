"use client";

import { useState, useEffect, useRef } from "react";
import { useReducedMotion, useInView } from "motion/react";

interface TypingTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  as?: "p" | "span" | "div";
}

export function TypingText({
  text,
  className,
  speed = 30,
  delay = 0,
  as: Tag = "p",
}: TypingTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });
  const [charCount, setCharCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [isInView, delay, prefersReducedMotion]);

  useEffect(() => {
    if (!started || prefersReducedMotion) return;
    if (charCount >= text.length) return;

    const interval = setInterval(() => {
      setCharCount((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [started, charCount, text.length, speed, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <Tag ref={ref as React.Ref<never>} className={className}>
        {text}
      </Tag>
    );
  }

  // Render full text invisibly to reserve vertical space (prevents CLS),
  // then overlay the typing text absolutely on top
  return (
    <Tag ref={ref as React.Ref<never>} className={`${className} relative`}>
      {/* Hidden full text reserves the correct height */}
      <span className="invisible" aria-hidden="true">{text}</span>
      {/* Visible typing overlay */}
      <span className="absolute inset-0">
        {text.slice(0, charCount)}
        {charCount < text.length && (
          <span className="terminal-cursor" />
        )}
      </span>
    </Tag>
  );
}

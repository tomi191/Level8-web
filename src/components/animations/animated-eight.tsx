"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const INFINITY_PATH =
  "M75,100 C75,72 95,50 125,50 C155,50 175,72 175,100 C175,128 155,150 125,150 C95,150 75,128 75,100 C75,72 55,50 25,50 C-5,50 -25,72 -25,100 C-25,128 -5,150 25,150 C55,150 75,128 75,100Z";

const particles = [
  { x: -60, y: -40, size: 3, duration: 6, delay: 0 },
  { x: 70, y: -50, size: 2, duration: 8, delay: 1 },
  { x: -50, y: 50, size: 4, duration: 7, delay: 0.5 },
  { x: 60, y: 40, size: 2.5, duration: 9, delay: 2 },
  { x: 0, y: -60, size: 3, duration: 5, delay: 1.5 },
];

interface AnimatedEightProps {
  className?: string;
}

export function AnimatedEight({ className }: AnimatedEightProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          "relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96",
          className
        )}
      >
        <svg
          viewBox="-60 10 270 180"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="cyber-glow-static" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="neon-grad-static" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#39ff14" />
              <stop offset="50%" stopColor="#00ff88" />
              <stop offset="100%" stopColor="#39ff14" />
            </linearGradient>
          </defs>
          <path
            d={INFINITY_PATH}
            stroke="#1e1e1e"
            strokeWidth={12}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={INFINITY_PATH}
            stroke="url(#neon-grad-static)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#cyber-glow-static)"
          />
          <circle
            cx="75"
            cy="100"
            r="6"
            fill="#39ff14"
            opacity={0.2}
            filter="url(#cyber-glow-static)"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96",
        className
      )}
    >
      {/* Floating HTML particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-neon"
          style={{
            width: p.size * 2,
            height: p.size * 2,
            left: "50%",
            top: "50%",
            filter: "blur(1px)",
          }}
          animate={{
            x: [p.x - 10, p.x + 10, p.x - 10],
            y: [p.y - 10, p.y + 10, p.y - 10],
            opacity: [0, 0.7, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      <svg
        viewBox="-60 10 270 180"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Neon glow filter */}
          <filter
            id="cyber-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Neon gradient */}
          <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#39ff14" />
            <stop offset="50%" stopColor="#00ff88" />
            <stop offset="100%" stopColor="#39ff14" />
          </linearGradient>
        </defs>

        {/* Dark rail stroke */}
        <path
          d={INFINITY_PATH}
          stroke="#1e1e1e"
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Neon animated stroke — draw/undraw cycle */}
        <motion.path
          d={INFINITY_PATH}
          stroke="url(#neon-grad)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#cyber-glow)"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            pathOffset: [0, 0, 0, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.6, 1],
          }}
        />

        {/* Secondary faint trail */}
        <motion.path
          d={INFINITY_PATH}
          stroke="#39ff14"
          strokeWidth={1}
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{
            pathLength: [0, 0.3, 0],
            pathOffset: [0, 0.5, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
            delay: 1,
          }}
        />

        {/* Orbiting dot — primary (SMIL animateMotion) */}
        <circle r="4" fill="#39ff14" filter="url(#cyber-glow)">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={INFINITY_PATH}
          />
        </circle>

        {/* Orbiting dot — secondary, slower */}
        <circle r="2.5" fill="#00ff88" opacity="0.6" filter="url(#cyber-glow)">
          <animateMotion
            dur="5s"
            repeatCount="indefinite"
            path={INFINITY_PATH}
            begin="1.5s"
          />
        </circle>

        {/* Radial connection lines from center */}
        {[
          { x2: -40, y2: 30, delay: 0 },
          { x2: 190, y2: 30, delay: 0.8 },
          { x2: -40, y2: 170, delay: 1.6 },
          { x2: 190, y2: 170, delay: 2.4 },
        ].map((line, i) => (
          <motion.line
            key={i}
            x1="75"
            y1="100"
            x2={line.x2}
            y2={line.y2}
            stroke="#39ff14"
            strokeWidth={0.5}
            opacity={0.15}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 0.7, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: line.delay,
            }}
          />
        ))}

        {/* Center crossing — pulsing glow */}
        <motion.circle
          cx="75"
          cy="100"
          fill="#39ff14"
          filter="url(#cyber-glow)"
          style={{ r: 6 }}
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 2.5, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer diffuse ring */}
        <motion.circle
          cx="75"
          cy="100"
          fill="none"
          stroke="#39ff14"
          strokeWidth={0.5}
          style={{ r: 20 }}
          animate={{ opacity: [0.08, 0.02, 0.08], scale: [1, 1.75, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

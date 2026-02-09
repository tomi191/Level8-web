"use client";

import type { ReactNode } from "react";
import {
  Hand,
  ChevronDown,
  ShoppingCart,
  Zap,
  Bot,
  Gem,
  Rocket,
  Coins,
  Mail,
  CircleCheck,
  RefreshCw,
  Wrench,
  BarChart3,
  Brain,
  Clapperboard,
  Trophy,
  Target,
  Sparkles,
  Clock,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  hand: Hand,
  down: ChevronDown,
  cart: ShoppingCart,
  zap: Zap,
  bot: Bot,
  gem: Gem,
  rocket: Rocket,
  coins: Coins,
  mail: Mail,
  check: CircleCheck,
  refresh: RefreshCw,
  wrench: Wrench,
  chart: BarChart3,
  brain: Brain,
  clapperboard: Clapperboard,
  trophy: Trophy,
  target: Target,
  sparkles: Sparkles,
  clock: Clock,
  globe: Globe,
};

const ICON_REGEX = /\{icon:(\w+)\}/g;

export function ChatIconText({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  ICON_REGEX.lastIndex = 0;

  while ((match = ICON_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const iconName = match[1];
    const Icon = ICON_MAP[iconName];

    if (Icon) {
      parts.push(
        <Icon
          key={`icon-${match.index}`}
          className="inline-block size-4 align-text-bottom"
          aria-hidden="true"
        />
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

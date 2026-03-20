import Link from "next/link";
import Image from "next/image";
import { Star, Heart } from "lucide-react";
import type { AgentSkill } from "@/lib/skills-data";

function formatStars(stars: number): string {
  if (stars >= 1000)
    return `${(stars / 1000).toFixed(stars >= 10000 ? 0 : 1)}k`;
  return String(stars);
}

interface SkillCardProps {
  skill: AgentSkill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const repoShort = skill.repo.replace("https://github.com/", "");
  const avatarUrl = `https://github.com/${skill.author}.png?size=40`;

  return (
    <Link
      href={`/tools/skills/${skill.id}`}
      className="group rounded-xl border border-border/60 bg-surface overflow-hidden hover:border-neon/30 transition-all duration-300 block"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 border-b border-border/40 bg-white/[0.02]">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[11px] text-muted-foreground/60 flex-1 truncate">
          {skill.id}.md
        </span>
        <div className="flex items-center gap-1 text-[11px] text-gold/80 shrink-0">
          <Star size={10} className="fill-current" />
          <span className="font-mono">{formatStars(skill.stars)}</span>
        </div>
      </div>

      {/* Code content with line numbers */}
      <div className="px-3 py-2.5 font-mono text-[13px]">
        <div className="flex gap-3">
          {/* Line numbers gutter */}
          <div className="flex flex-col text-right text-syntax-line-number text-[11px] select-none leading-[22px] w-4 shrink-0">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
          {/* Code lines */}
          <div className="flex-1 min-w-0 leading-[22px]">
            {/* Line 1: export skill-name */}
            <div className="truncate">
              <span className="text-syntax-keyword">export </span>
              <span className="text-foreground font-bold group-hover:text-neon transition-colors">
                {skill.id}
              </span>
            </div>
            {/* Line 2: from "author/repo" with avatar */}
            <div className="flex items-center gap-1.5 truncate">
              <Image
                src={avatarUrl}
                alt={skill.author}
                width={16}
                height={16}
                className="rounded-full shrink-0"
                unoptimized
              />
              <span className="truncate">
                <span className="text-syntax-from">from </span>
                <span className="text-syntax-string/85">
                  &quot;{repoShort}&quot;
                </span>
              </span>
            </div>
            {/* Lines 3-4: description as comments */}
            <div className="text-syntax-comment text-[11px] line-clamp-2 leading-[22px]">
              <span className="text-syntax-comment/80">{"// "}</span>
              {skill.description}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border/30 bg-white/[0.01] flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground/50">
          {skill.updatedAt || "2026-01-01"}
        </span>
        <Heart
          size={12}
          className="text-muted-foreground/25 group-hover:text-neon/40 transition-colors"
        />
      </div>
    </Link>
  );
}

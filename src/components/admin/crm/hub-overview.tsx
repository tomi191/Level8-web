import Link from "next/link";
import {
  Database,
  Activity,
  Globe,
  ArrowRight,
} from "lucide-react";
import type { HubOverviewProject } from "@/types/crm";

interface HubOverviewProps {
  projects: HubOverviewProject[];
}

export function HubOverview({ projects }: HubOverviewProps) {
  if (projects.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // HUB
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          \u0421\u0432\u044A\u0440\u0437\u0430\u043D\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0438
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20">
        {projects.map((project) => (
          <Link
            key={project.website_id}
            href={`/admin/crm/websites/${project.website_id}`}
            className="bg-surface p-4 hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-neon/60" />
                <span className="text-sm font-mono font-bold text-foreground">
                  {project.domain}
                </span>
              </div>
              <ArrowRight
                size={14}
                className="text-muted-foreground/20 group-hover:text-neon/60 transition-colors"
              />
            </div>
            <p className="text-xs text-muted-foreground/50 mb-3">
              {project.client_name}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Database size={12} className="text-muted-foreground/30" />
                <span className="text-[10px] font-mono text-muted-foreground">
                  {project.tables_configured} \u0442\u0430\u0431\u043B.
                </span>
              </div>
              {project.recent_events > 0 && (
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-neon/60" />
                  <span className="text-[10px] font-mono text-neon">
                    {project.recent_events} (24h)
                  </span>
                </div>
              )}
            </div>
            {project.last_sync && (
              <p className="text-[10px] text-muted-foreground/20 font-mono mt-2">
                sync: {new Date(project.last_sync).toLocaleDateString("bg-BG")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

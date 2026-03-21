"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Database,
  Link2,
  Unlink,
  RefreshCw,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { connectHub, disconnectHub, discoverHubSchema } from "@/lib/hub/actions";
import { HubTableViewer } from "@/components/admin/crm/hub-table-viewer";
import { HubConfig } from "@/components/admin/crm/hub-config";
import type { HubConnectionStatus, HubSchemaTable } from "@/types/crm";

interface HubConnectionProps {
  websiteId: string;
  status: HubConnectionStatus | null;
}

export function HubConnection({ websiteId, status }: HubConnectionProps) {
  const [isPending, startTransition] = useTransition();
  const [projectUrl, setProjectUrl] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [schema, setSchema] = useState<HubSchemaTable[] | null>(null);
  const [browsingTable, setBrowsingTable] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isConnected = status?.connected ?? false;
  const webhookUrl = status?.webhook_token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/hub/webhook`
    : null;

  function handleConnect() {
    if (!projectUrl || !serviceKey) {
      toast.error("\u041C\u043E\u043B\u044F \u043F\u043E\u043F\u044A\u043B\u043D\u0435\u0442\u0435 \u0438 \u0434\u0432\u0435\u0442\u0435 \u043F\u043E\u043B\u0435\u0442\u0430");
      return;
    }
    startTransition(async () => {
      const result = await connectHub(websiteId, projectUrl, serviceKey);
      if (result.success) {
        toast.success("Hub \u0441\u0432\u044A\u0440\u0437\u0430\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E");
        setProjectUrl("");
        setServiceKey("");
        setShowConnect(false);
      } else {
        toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0441\u0432\u044A\u0440\u0437\u0432\u0430\u043D\u0435");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("\u0421\u0438\u0433\u0443\u0440\u043D\u0438 \u043B\u0438 \u0441\u0442\u0435, \u0447\u0435 \u0438\u0441\u043A\u0430\u0442\u0435 \u0434\u0430 \u0440\u0430\u0437\u043A\u0430\u0447\u0438\u0442\u0435 Hub?")) return;
    startTransition(async () => {
      const result = await disconnectHub(websiteId);
      if (result.success) {
        toast.success("Hub \u0440\u0430\u0437\u043A\u0430\u0447\u0435\u043D");
        setSchema(null);
      } else {
        toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  function handleDiscover() {
    startTransition(async () => {
      const result = await discoverHubSchema(websiteId);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSchema(result.tables);
        toast.success(`\u041D\u0430\u043C\u0435\u0440\u0435\u043D\u0438 ${result.tables.length} \u0442\u0430\u0431\u043B\u0438\u0446\u0438`);
      }
    });
  }

  function copyWebhookUrl() {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL \u043A\u043E\u043F\u0438\u0440\u0430\u043D");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
            // HUB
          </span>
          <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
            Supabase Hub
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {"\u0421\u0432\u044A\u0440\u0437\u0430\u043D"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscover}
                disabled={isPending}
                className="text-neon hover:text-neon hover:bg-neon/10"
              >
                <RefreshCw size={14} className={cn("mr-1.5", isPending && "animate-spin")} />
                Discover
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isPending}
                className="text-red-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Unlink size={14} className="mr-1.5" />
                {"\u0420\u0430\u0437\u043A\u0430\u0447\u0438"}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConnect(!showConnect)}
              className="text-neon hover:text-neon hover:bg-neon/10"
            >
              <Link2 size={14} className="mr-1.5" />
              {"\u0421\u0432\u044A\u0440\u0436\u0438"}
            </Button>
          )}
        </div>
      </div>

      {/* Connect form */}
      {!isConnected && showConnect && (
        <div className="p-5 space-y-4 border-b border-border/30">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground/60">Supabase Project URL</Label>
            <Input
              placeholder="https://xxx.supabase.co"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground/60">Service Role Key</Label>
            <Input
              type="password"
              placeholder="eyJhbGci..."
              value={serviceKey}
              onChange={(e) => setServiceKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground/30">
              Settings &rarr; API &rarr; service_role key. {"\u0428\u0438\u0444\u0440\u0438\u0440\u0430 \u0441\u0435 \u0441 AES-256-GCM."}
            </p>
          </div>
          <Button
            onClick={handleConnect}
            disabled={isPending || !projectUrl || !serviceKey}
            className="bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
          >
            {isPending ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Database size={14} className="mr-1.5" />
            )}
            {"\u0421\u0432\u044A\u0440\u0436\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0430"}
          </Button>
        </div>
      )}

      {/* Connection info */}
      {isConnected && (
        <div className="p-5 space-y-4">
          {status?.project_url && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground/50 shrink-0">Project URL</span>
              <span className="text-sm text-foreground font-mono text-right truncate">
                {status.project_url}
              </span>
            </div>
          )}
          {status?.last_sync && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground/50 shrink-0">{"\u041F\u043E\u0441\u043B\u0435\u0434\u0435\u043D sync"}</span>
              <span className="text-sm text-foreground font-mono text-right">
                {new Date(status.last_sync).toLocaleString("bg-BG")}
              </span>
            </div>
          )}
          {webhookUrl && (
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground/50">Webhook URL</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] font-mono bg-background rounded-lg border border-border px-3 py-2 text-muted-foreground truncate">
                  {webhookUrl}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyWebhookUrl}
                  className="shrink-0 text-muted-foreground hover:text-neon"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/30">
                {"\u0414\u043E\u0431\u0430\u0432\u0435\u0442\u0435 \u0442\u043E\u0437\u0438 URL \u043A\u0430\u0442\u043E Database Webhook \u0432 Supabase Dashboard."}
                {" Header: "}<code className="text-neon/40">X-Hub-Token: {status?.webhook_token}</code>
              </p>
            </div>
          )}
          {status?.tables_config && Object.keys(status.tables_config).length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground/50 shrink-0">{"\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u0430\u043D\u0438 \u0442\u0430\u0431\u043B\u0438\u0446\u0438"}</span>
              <span className="text-sm text-neon font-mono font-bold">
                {Object.keys(status.tables_config).length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Schema explorer */}
      {schema && schema.length > 0 && (
        <div className="border-t border-border/30">
          <div className="px-5 py-3 border-b border-border/20">
            <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase">
              // SCHEMA ({schema.length} {"\u0442\u0430\u0431\u043B\u0438\u0446\u0438"})
            </span>
          </div>
          <div className="divide-y divide-border/20">
            {schema.map((table) => (
              <SchemaTableRow
                key={table.name}
                table={table}
                onBrowse={() => setBrowsingTable(table.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Table data viewer */}
      {browsingTable && (
        <HubTableViewer
          websiteId={websiteId}
          tableName={browsingTable}
          onClose={() => setBrowsingTable(null)}
        />
      )}

      {/* Table notification config */}
      {isConnected && schema && schema.length > 0 && (
        <HubConfig
          websiteId={websiteId}
          tables={schema}
          currentConfig={status?.tables_config || {}}
        />
      )}
    </div>
  );
}

function SchemaTableRow({ table, onBrowse }: { table: HubSchemaTable; onBrowse: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Database size={14} className="text-neon/40" />
          <span className="text-sm font-mono text-foreground">{table.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground/40">
            {table.columns.length} cols
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground">
            {table.row_count.toLocaleString("bg-BG")} rows
          </span>
          <span className={cn("text-muted-foreground/40 transition-transform", expanded && "rotate-90")}>
            &rsaquo;
          </span>
        </div>
      </button>
      {expanded && (
        <div className="px-5 pb-3">
          <div className="rounded-lg border border-border/30 bg-background overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="px-3 py-1.5 text-left font-mono text-muted-foreground/40 font-normal">Column</th>
                  <th className="px-3 py-1.5 text-left font-mono text-muted-foreground/40 font-normal">Type</th>
                  <th className="px-3 py-1.5 text-center font-mono text-muted-foreground/40 font-normal">Null?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {table.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-1.5 font-mono text-foreground">{col.name}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{col.data_type}</td>
                    <td className="px-3 py-1.5 text-center text-muted-foreground/40">
                      {col.is_nullable ? "yes" : "no"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onBrowse(); }}
            className="mt-2 text-neon hover:text-neon hover:bg-neon/10 text-xs"
          >
            <Database size={12} className="mr-1.5" />
            Browse data
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellOff,
  Settings,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { updateHubTableConfig, removeHubTableConfig } from "@/lib/hub/actions";
import type { HubTableConfig, HubTablesConfig, HubSchemaTable } from "@/types/crm";

interface HubConfigProps {
  websiteId: string;
  tables: HubSchemaTable[];
  currentConfig: HubTablesConfig;
}

export function HubConfig({ websiteId, tables, currentConfig }: HubConfigProps) {
  const [isPending, startTransition] = useTransition();
  const [editingTable, setEditingTable] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // \u041A\u041E\u041D\u0424\u0418\u0413\u0423\u0420\u0410\u0426\u0418\u042F
        </span>
        <h2 className="font-display text-lg font-bold text-foreground mt-0.5">
          \u041D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 \u043F\u043E \u0442\u0430\u0431\u043B\u0438\u0446\u0438
        </h2>
      </div>

      {tables.length === 0 ? (
        <div className="p-5 text-center">
          <p className="text-sm text-muted-foreground/50 font-mono">
            \u041F\u044A\u0440\u0432\u043E \u0438\u0437\u043F\u044A\u043B\u043D\u0435\u0442\u0435 Discover \u0437\u0430 \u0434\u0430 \u0432\u0438\u0434\u0438\u0442\u0435 \u0442\u0430\u0431\u043B\u0438\u0446\u0438\u0442\u0435.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {tables.map((table) => {
            const config = currentConfig[table.name];
            const isEditing = editingTable === table.name;

            return (
              <div key={table.name} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config?.notify ? (
                      <Bell size={14} className="text-neon" />
                    ) : (
                      <BellOff size={14} className="text-muted-foreground/30" />
                    )}
                    <span className="font-mono text-sm text-foreground">{table.name}</span>
                    {config && (
                      <span className="text-[10px] font-mono text-neon/60 bg-neon/5 px-1.5 py-0.5 rounded">
                        {config.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTable(isEditing ? null : table.name)}
                      className="h-7 text-muted-foreground hover:text-foreground"
                    >
                      <Settings size={14} />
                    </Button>
                    {config && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const result = await removeHubTableConfig(websiteId, table.name);
                            if (result.success) toast.success("\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F\u0442\u0430 \u0435 \u043F\u0440\u0435\u043C\u0430\u0445\u043D\u0430\u0442\u0430");
                            else toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430");
                          });
                        }}
                        className="h-7 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <TableConfigForm
                    websiteId={websiteId}
                    tableName={table.name}
                    columns={table.columns.map((c) => c.name)}
                    initial={config || null}
                    onSaved={() => setEditingTable(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TableConfigForm({
  websiteId,
  tableName,
  columns,
  initial,
  onSaved,
}: {
  websiteId: string;
  tableName: string;
  columns: string[];
  initial: HubTableConfig | null;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [label, setLabel] = useState(initial?.label || tableName);
  const [icon, setIcon] = useState(initial?.icon || "bell");
  const [notify, setNotify] = useState(initial?.notify ?? true);
  const [notifyFields, setNotifyFields] = useState(
    initial?.notify_fields?.join(", ") || ""
  );
  const [countField, setCountField] = useState(
    initial?.count_field || "created_at"
  );
  const [template, setTemplate] = useState(
    initial?.message_template || `\u041D\u043E\u0432 ${tableName}`
  );

  function handleSave() {
    startTransition(async () => {
      const config: HubTableConfig = {
        label,
        icon,
        notify,
        notify_fields: notifyFields
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        count_field: countField,
        message_template: template,
      };
      const result = await updateHubTableConfig(websiteId, tableName, config);
      if (result.success) {
        toast.success(`${tableName} \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0438\u0440\u0430\u043D\u0430`);
        onSaved();
      } else {
        toast.error(result.error || "\u0413\u0440\u0435\u0448\u043A\u0430");
      }
    });
  }

  return (
    <div className="mt-3 p-4 rounded-lg border border-border/30 bg-background space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground/50">\u0415\u0442\u0438\u043A\u0435\u0442</Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground/50">Icon (lucide)</Label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="h-8 text-sm font-mono"
            placeholder="bell, shopping-cart..."
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground/50">
          \u041F\u043E\u043B\u0435\u0442\u0430 \u0437\u0430 \u043D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F (comma-separated)
        </Label>
        <Input
          value={notifyFields}
          onChange={(e) => setNotifyFields(e.target.value)}
          className="h-8 text-sm font-mono"
          placeholder={columns.slice(0, 3).join(", ")}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground/50">\u0428\u0430\u0431\u043B\u043E\u043D \u0437\u0430 \u0441\u044A\u043E\u0431\u0449\u0435\u043D\u0438\u0435</Label>
        <Input
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="h-8 text-sm font-mono"
          placeholder="\u041D\u043E\u0432\u0430 \u043F\u043E\u0440\u044A\u0447\u043A\u0430 \u2014 {name} \u2014 {email}"
        />
        <p className="text-[10px] text-muted-foreground/30">
          \u0418\u0437\u043F\u043E\u043B\u0437\u0432\u0430\u0439\u0442\u0435 &#123;field_name&#125; \u0437\u0430 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u043D\u0438 \u0441\u0442\u043E\u0439\u043D\u043E\u0441\u0442\u0438
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="accent-[#39ff14]"
          />
          <span className="text-xs text-muted-foreground">Telegram \u043D\u043E\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438</span>
        </label>
        <Button
          onClick={handleSave}
          disabled={isPending || !label}
          size="sm"
          className="bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20"
        >
          {isPending ? (
            <Loader2 size={14} className="mr-1.5 animate-spin" />
          ) : (
            <Save size={14} className="mr-1.5" />
          )}
          \u0417\u0430\u043F\u0430\u0437\u0438
        </Button>
      </div>
    </div>
  );
}

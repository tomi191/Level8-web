"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface SubmissionTabsProps {
  counts: { contact: number; lead: number; chat: number };
  children: React.ReactNode;
}

const TAB_CONFIG = [
  { value: "contact", label: "Контакт" },
  { value: "lead", label: "Одит" },
  { value: "chat", label: "Чатбот" },
] as const;

export function SubmissionTabs({ counts, children }: SubmissionTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "contact";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/admin/submissions?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="bg-surface border border-border">
        {TAB_CONFIG.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-neon/10 data-[state=active]:text-neon gap-2"
          >
            {tab.label}
            <Badge
              variant="outline"
              className="text-[10px] font-mono h-5 min-w-5 justify-center border-neon/20 text-neon/60"
            >
              {counts[tab.value]}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

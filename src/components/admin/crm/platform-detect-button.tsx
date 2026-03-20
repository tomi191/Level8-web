"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Loader2 } from "lucide-react";
import { detectWebsitePlatform, detectAllPlatforms } from "@/lib/crm-actions";
import { toast } from "sonner";

interface PlatformDetectButtonProps {
  websiteId?: string;
  mode?: "single" | "all";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function PlatformDetectButton({
  websiteId,
  mode = "single",
  variant = "outline",
  size = "sm",
}: PlatformDetectButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDetect() {
    startTransition(async () => {
      try {
        if (mode === "all") {
          const result = await detectAllPlatforms();
          toast.success(
            `Детектирани: ${result.detected}/${result.total}${result.errors ? `, грешки: ${result.errors}` : ""}`
          );
        } else if (websiteId) {
          const result = await detectWebsitePlatform(websiteId);
          if (result.error) {
            toast.error(`Грешка: ${result.error}`);
          } else {
            toast.success(
              `Платформа: ${result.platform ?? "неизвестна"}${result.platform_version ? ` v${result.platform_version}` : ""} (${result.signals.length} сигнала)`
            );
          }
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Възникна грешка"
        );
      }
    });
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDetect}
      disabled={isPending}
      className="border-border/50 text-muted-foreground hover:text-neon hover:border-neon/30"
    >
      {isPending ? (
        <>
          <Loader2 size={14} className="animate-spin mr-1.5" />
          {mode === "all" ? "Детектиране..." : "Сканиране..."}
        </>
      ) : (
        <>
          <Cpu size={14} className="mr-1.5" />
          {mode === "all" ? "Детектирай всички" : "Детектирай платформа"}
        </>
      )}
    </Button>
  );
}

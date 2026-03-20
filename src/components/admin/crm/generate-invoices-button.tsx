"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generateRecurringInvoices } from "@/lib/crm-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function GenerateInvoicesButton() {
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      try {
        const result = await generateRecurringInvoices();
        if (result.generated === 0 && result.errors.length === 0) {
          toast.info("Няма услуги за фактуриране днес");
        } else if (result.errors.length > 0) {
          toast.warning(
            `Генерирани: ${result.generated}, грешки: ${result.errors.length}`
          );
        } else {
          toast.success(
            `Генерирани ${result.generated} фактури`
          );
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Грешка при генериране"
        );
      }
    });
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={isPending}
      className={cn(
        "bg-emerald-600 text-white hover:bg-emerald-700 font-medium",
        "inline-flex items-center gap-2"
      )}
    >
      <RefreshCw size={16} className={cn(isPending && "animate-spin")} />
      {isPending ? "Генериране..." : "Генерирай фактури"}
    </Button>
  );
}

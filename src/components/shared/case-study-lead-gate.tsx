"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { Loader2, Terminal, Check } from "lucide-react";
import { submitLeadMagnet } from "@/lib/actions";
import { AttributionFields } from "@/components/shared/attribution-fields";
import { Input } from "@/components/ui/input";
import { CtaButton } from "@/components/shared/cta-button";
import { toast } from "sonner";
import type { FormState } from "@/types";

const initialState: FormState = { success: false, message: "" };

interface CaseStudyLeadGateProps {
  projectName: string;
}

export function CaseStudyLeadGate({ projectName }: CaseStudyLeadGateProps) {
  const [state, formAction, isPending] = useActionState(submitLeadMagnet, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Lead");
      }
    }
  }, [state.success, state.message]);

  return (
    <div className="rounded-2xl border border-neon/30 bg-background overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-red-500/50" />
        <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <span className="w-2 h-2 rounded-full bg-green-500/50" />
        <span className="font-mono-terminal text-[10px] text-muted-foreground/50 ml-2 tracking-wider">
          level8 consult --request
        </span>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          <Terminal size={20} className="text-neon shrink-0 mt-1" />
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-1.5">
              Искате ли такъв анализ за вашия продукт?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Показахме какво научихме от <span className="text-neon">{projectName}</span>.
              Ако искате да прегледаме архитектурата, производителността и разходите за AI на
              вашия продукт — оставете имейл. Безплатен 10-точков анализ, без ангажимент.
            </p>
          </div>
        </div>

        {state.success ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 p-4 rounded-lg bg-neon/10 border border-neon/30"
          >
            <Check className="text-neon shrink-0" size={18} />
            <p className="text-neon font-medium text-sm">{state.message}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-3">
            <AttributionFields />
            <div className="flex items-center gap-2">
              <span className="font-mono-terminal text-neon/40 text-sm shrink-0">$</span>
              <div className="flex-1">
                <label htmlFor={`lead-${projectName}`} className="sr-only">
                  Имейл адрес
                </label>
                <Input
                  id={`lead-${projectName}`}
                  type="email"
                  name="email"
                  placeholder="вашият@имейл.bg"
                  required
                  className="bg-surface border-border focus:border-neon/50"
                />
              </div>
            </div>
            <CtaButton type="submit" variant="neon" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Изпращане...
                </>
              ) : (
                "Заяви безплатен анализ"
              )}
            </CtaButton>
            <p className="text-[11px] text-muted-foreground/60 text-center">
              Отговаряме в рамките на 24ч. Без спам.
            </p>
          </form>
        )}

        {state.errors?.email && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { LEAD_MAGNET } from "@/lib/constants";
import { submitLeadMagnet } from "@/lib/actions";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { Input } from "@/components/ui/input";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FormState } from "@/types";

const initialState: FormState = { success: false, message: "" };

export function LeadMagnet() {
  const [state, formAction, isPending] = useActionState(submitLeadMagnet, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    }
  }, [state.success, state.message]);

  return (
    <SectionWrapper id="lead-magnet" className="bg-surface">
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            {LEAD_MAGNET.title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            {LEAD_MAGNET.subtitle}
          </p>

          {/* Terminal window wrapper */}
          <div className="max-w-md mx-auto rounded-2xl border border-border bg-background overflow-hidden">
            {/* Terminal chrome header */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <span className="w-2 h-2 rounded-full bg-green-500/50" />
              <span className="font-mono-terminal text-[10px] text-muted-foreground/50 ml-2 tracking-wider">
                level8 audit --request
              </span>
            </div>

            <div className="p-4">
              {state.success ? (
                <div role="status" aria-live="polite" className="p-4 rounded-lg bg-neon/10 border border-neon/30">
                  <p className="text-neon font-medium">{state.message}</p>
                </div>
              ) : (
                <form action={formAction} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="font-mono-terminal text-neon/40 text-sm shrink-0">$</span>
                    <div className="flex-1">
                      <label htmlFor="lead-email" className="sr-only">Имейл адрес</label>
                      <Input
                        id="lead-email"
                        type="email"
                        name="email"
                        placeholder={LEAD_MAGNET.placeholder}
                        required
                        aria-describedby={state.errors?.email ? "lead-email-error" : undefined}
                        className="bg-surface border-border focus:border-neon/50"
                      />
                    </div>
                  </div>
                  <CtaButton type="submit" variant="neon" disabled={isPending}>
                    {isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Изпращане...</>
                    ) : LEAD_MAGNET.cta}
                  </CtaButton>
                </form>
              )}

              {state.errors?.email && (
                <p id="lead-email-error" role="alert" className="mt-2 text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}

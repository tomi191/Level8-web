"use client";

import { useActionState } from "react";
import { LEAD_MAGNET } from "@/lib/constants";
import { submitLeadMagnet } from "@/lib/actions";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { Input } from "@/components/ui/input";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
import type { FormState } from "@/types";

const initialState: FormState = { success: false, message: "" };

export function LeadMagnet() {
  const [state, formAction, isPending] = useActionState(submitLeadMagnet, initialState);

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

          {state.success ? (
            <div className="p-4 rounded-lg bg-neon/10 border border-neon/30">
              <p className="text-neon font-medium">{state.message}</p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                name="email"
                placeholder={LEAD_MAGNET.placeholder}
                required
                className="bg-background border-border focus:border-neon/50 flex-1"
              />
              <CtaButton type="submit" variant="neon" disabled={isPending}>
                {isPending ? "Изпращане..." : LEAD_MAGNET.cta}
              </CtaButton>
            </form>
          )}

          {state.errors?.email && (
            <p className="mt-2 text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}

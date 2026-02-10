"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { FileText, Clock, Loader2 } from "lucide-react";
import { LEAD_MAGNET } from "@/lib/constants";
import { submitLeadMagnet } from "@/lib/actions";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { Input } from "@/components/ui/input";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
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
      {/* Section heading */}
      <FadeIn>
        <div className="text-center mb-12 md:mb-16">
          <span className="font-mono-terminal text-neon/40 text-xs tracking-[0.25em] uppercase">
            {"// "}{LEAD_MAGNET.tag}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            {LEAD_MAGNET.title}
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {LEAD_MAGNET.subtitle}
          </p>
        </div>
      </FadeIn>

      {/* Two-column: checklist + form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
        {/* Left: What you get */}
        <FadeIn>
          <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
            <h3 className="font-display text-lg font-bold text-foreground mb-5">
              Какво включва одитът:
            </h3>
            <ul className="space-y-3">
              {LEAD_MAGNET.auditPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="font-mono-terminal text-neon text-xs mt-0.5 flex-shrink-0">
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            {/* Meta info */}
            <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText size={14} className="text-neon/60" />
                {LEAD_MAGNET.format}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-neon/60" />
                Доставка {LEAD_MAGNET.timeline}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Right: Terminal form */}
        <FadeIn delay={0.15}>
          <div className="rounded-2xl border border-border bg-background overflow-hidden">
            {/* Terminal chrome header */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
              <span className="w-2 h-2 rounded-full bg-red-500/50" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <span className="w-2 h-2 rounded-full bg-green-500/50" />
              <span className="font-mono-terminal text-[10px] text-muted-foreground/50 ml-2 tracking-wider">
                level8 audit --request
              </span>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-sm text-muted-foreground mb-6">
                Въведете имейла си и ще получите персонализиран PDF доклад с всичките 10 точки, специално за вашия бизнес.
              </p>

              {state.success ? (
                <div role="status" aria-live="polite" className="p-4 rounded-lg bg-neon/10 border border-neon/30">
                  <p className="text-neon font-medium">{state.message}</p>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <div className="flex items-center gap-2">
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
                  <CtaButton type="submit" variant="neon" className="w-full" disabled={isPending}>
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
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}

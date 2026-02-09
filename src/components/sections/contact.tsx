"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { CONTACT_SECTION, GDPR } from "@/lib/constants";
import { submitContactForm } from "@/lib/actions";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FormState } from "@/types";

const initialState: FormState = { success: false, message: "" };

export function Contact() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const { form } = CONTACT_SECTION;

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else if (state.errors) {
        toast.error(state.message);
      }
    }
  }, [state.success, state.message, state.errors]);

  return (
    <SectionWrapper id="contact">
      <FadeIn>
        <SectionHeading
          title={CONTACT_SECTION.title}
          subtitle={CONTACT_SECTION.subtitle}
        />
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="max-w-xl mx-auto rounded-2xl border border-border bg-surface overflow-hidden">
          {/* Terminal chrome header */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            <span className="font-mono-terminal text-[10px] text-muted-foreground/50 ml-2 tracking-wider">
              level8 contact --new
            </span>
          </div>

          <div className="p-6 md:p-8">
            {state.success ? (
              <div role="status" aria-live="polite" className="p-6 rounded-lg bg-neon/10 border border-neon/30 text-center">
                <p className="text-neon font-medium text-lg">{state.message}</p>
              </div>
            ) : (
              <form action={formAction} className="space-y-5">
                <div>
                  <label htmlFor="contact-name" className="font-mono-terminal text-[10px] text-muted-foreground/50 tracking-wider mb-1.5 block">$ name</label>
                  <Input
                    id="contact-name"
                    name="name"
                    placeholder={form.name}
                    required
                    aria-describedby={state.errors?.name ? "contact-name-error" : undefined}
                    className="bg-background border-border focus:border-neon/50"
                  />
                  {state.errors?.name && (
                    <p id="contact-name-error" role="alert" className="mt-1 text-sm text-destructive">{state.errors.name[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-phone" className="font-mono-terminal text-[10px] text-muted-foreground/50 tracking-wider mb-1.5 block">$ phone</label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder={form.phone}
                    required
                    aria-describedby={state.errors?.phone ? "contact-phone-error" : undefined}
                    className="bg-background border-border focus:border-neon/50"
                  />
                  {state.errors?.phone && (
                    <p id="contact-phone-error" role="alert" className="mt-1 text-sm text-destructive">{state.errors.phone[0]}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-website" className="font-mono-terminal text-[10px] text-muted-foreground/50 tracking-wider mb-1.5 block">$ website</label>
                  <Input
                    id="contact-website"
                    name="website"
                    type="text"
                    placeholder={form.website}
                    className="bg-background border-border focus:border-neon/50"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="font-mono-terminal text-[10px] text-muted-foreground/50 tracking-wider mb-1.5 block">$ message</label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder={form.message}
                    required
                    rows={5}
                    aria-describedby={state.errors?.message ? "contact-message-error" : undefined}
                    className="bg-background border-border focus:border-neon/50 resize-none"
                  />
                  {state.errors?.message && (
                    <p id="contact-message-error" role="alert" className="mt-1 text-sm text-destructive">{state.errors.message[0]}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-1 h-4 w-4 rounded border-border accent-neon"
                    />
                    <span className="text-sm text-muted-foreground">
                      {GDPR.consentLabel}{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon underline underline-offset-2 hover:text-neon/80"
                      >
                        {GDPR.consentLink}
                      </a>
                    </span>
                  </label>
                  {state.errors?.consent && (
                    <p id="contact-consent-error" role="alert" className="mt-1 text-sm text-destructive">{state.errors.consent[0]}</p>
                  )}
                </div>

                <CtaButton
                  type="submit"
                  variant="neon"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Изпращане...</>
                  ) : (
                    <><span className="font-mono-terminal mr-1">&gt;</span> {form.submit}</>
                  )}
                </CtaButton>
              </form>
            )}
          </div>
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}

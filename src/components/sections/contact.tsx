"use client";

import { useActionState } from "react";
import { CONTACT_SECTION, GDPR } from "@/lib/constants";
import { submitContactForm } from "@/lib/actions";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/shared/section-heading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CtaButton } from "@/components/shared/cta-button";
import { FadeIn } from "@/components/animations/fade-in";
import type { FormState } from "@/types";

const initialState: FormState = { success: false, message: "" };

export function Contact() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
  const { form } = CONTACT_SECTION;

  return (
    <SectionWrapper id="contact">
      <FadeIn>
        <SectionHeading
          title={CONTACT_SECTION.title}
          subtitle={CONTACT_SECTION.subtitle}
        />
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="max-w-xl mx-auto">
          {state.success ? (
            <div className="p-6 rounded-lg bg-neon/10 border border-neon/30 text-center">
              <p className="text-neon font-medium text-lg">{state.message}</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <div>
                <Input
                  name="name"
                  placeholder={form.name}
                  required
                  className="bg-surface border-border focus:border-neon/50"
                />
                {state.errors?.name && (
                  <p className="mt-1 text-sm text-destructive">{state.errors.name[0]}</p>
                )}
              </div>

              <div>
                <Input
                  name="phone"
                  type="tel"
                  placeholder={form.phone}
                  required
                  className="bg-surface border-border focus:border-neon/50"
                />
                {state.errors?.phone && (
                  <p className="mt-1 text-sm text-destructive">{state.errors.phone[0]}</p>
                )}
              </div>

              <div>
                <Input
                  name="website"
                  type="url"
                  placeholder={form.website}
                  className="bg-surface border-border focus:border-neon/50"
                />
              </div>

              <div>
                <Textarea
                  name="message"
                  placeholder={form.message}
                  required
                  rows={5}
                  className="bg-surface border-border focus:border-neon/50 resize-none"
                />
                {state.errors?.message && (
                  <p className="mt-1 text-sm text-destructive">{state.errors.message[0]}</p>
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
                  <p className="mt-1 text-sm text-destructive">{state.errors.consent[0]}</p>
                )}
              </div>

              <CtaButton
                type="submit"
                variant="neon"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Изпращане..." : form.submit}
              </CtaButton>
            </form>
          )}
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}

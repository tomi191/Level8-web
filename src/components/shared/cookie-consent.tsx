"use client";

import { useState, useEffect } from "react";
import { getConsent, setConsent, type ConsentValue } from "@/lib/consent";
import { CtaButton } from "@/components/shared/cta-button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      setVisible(true);
    }

    const handleConsentChanged = () => {
      setVisible(getConsent() === null);
    };

    window.addEventListener("consentChanged", handleConsentChanged);
    return () => window.removeEventListener("consentChanged", handleConsentChanged);
  }, []);

  const handleChoice = (value: ConsentValue) => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Бисквитки"
      className="fixed bottom-0 inset-x-0 z-[10000] bg-surface/95 backdrop-blur-md border-t border-border hero-fade-up motion-reduce:animate-none"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Използваме бисквитки за анализ (Google Analytics) и маркетинг (Facebook Pixel).
          Може да приемете или откажете.{" "}
          <a
            href="/privacy"
            className="text-neon underline underline-offset-2 hover:text-neon/80"
          >
            Поверителност
          </a>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <CtaButton variant="outline" onClick={() => handleChoice("declined")}>
            Отказвам
          </CtaButton>
          <CtaButton variant="neon" onClick={() => handleChoice("accepted")}>
            Приемам
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

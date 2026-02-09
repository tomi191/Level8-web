"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-dvh flex items-center justify-center bg-grid-pattern overflow-hidden relative">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon/5 rounded-full blur-[100px] pointer-events-none" />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.07_0_0)_75%)]" />

      <div className="text-center relative z-10 space-y-6 px-4">
        <h1 className="font-display text-[8rem] md:text-[12rem] font-bold text-red-500 glitch-loop leading-none">
          500
        </h1>

        <div className="font-mono-terminal text-sm space-y-1 text-left inline-block">
          <p className="text-muted-foreground">$ process.status</p>
          <p className="text-red-500/80">ERR: RUNTIME_EXCEPTION</p>
          <p className="text-muted-foreground">
            Възникна неочаквана грешка. Моля, опитайте отново.
          </p>
          {error.digest && (
            <p className="text-muted-foreground/50 text-xs mt-2">
              ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-neon/30 bg-neon/10 px-6 py-3 font-mono-terminal text-sm text-neon transition-all hover:bg-neon/20 hover:border-neon/50 hover:shadow-[0_0_20px_oklch(0.85_0.27_142/0.15)]"
          >
            ↻ Опитай пак
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-mono-terminal text-sm text-muted-foreground transition-all hover:text-foreground hover:border-foreground/30"
          >
            ← Към началото
          </a>
        </div>
      </div>
    </main>
  );
}

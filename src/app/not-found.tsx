import { Navbar } from "@/components/layout/navbar";
import { AnimatedEight } from "@/components/animations/animated-eight";
import { CtaButton } from "@/components/shared/cta-button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-dvh flex items-center justify-center bg-grid-pattern overflow-hidden relative">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0.07_0_0)_75%)]" />

        <div className="text-center relative z-10 space-y-6 px-4">
          <h1 className="font-display text-[8rem] md:text-[12rem] font-bold text-neon text-glow-neon glitch-loop leading-none">
            404
          </h1>

          <div className="font-mono-terminal text-sm space-y-1 text-left inline-block">
            <p className="text-muted-foreground">$ cat /route</p>
            <p className="text-red-500/80">ERR: ROUTE_NOT_FOUND</p>
            <p className="text-muted-foreground">
              Тази страница не съществува или е преместена.
            </p>
          </div>

          <div className="flex justify-center">
            <AnimatedEight className="w-32 h-32 md:w-40 md:h-40" />
          </div>

          <div>
            <CtaButton href="/" variant="outline">
              ← Към началото
            </CtaButton>
          </div>
        </div>
      </main>
    </>
  );
}

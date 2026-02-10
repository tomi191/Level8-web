import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin | ЛЕВЕЛ 8",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-neon/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        {/* Terminal chrome card */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-border/30">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="flex-1 text-center font-mono text-[10px] text-muted-foreground/50">
              level8 auth --login
            </span>
          </div>

          {/* Form content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                LEVEL<span className="text-neon text-glow-neon">8</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Контролен панел
              </p>
            </div>

            <AdminLoginForm />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6 font-mono">
          &copy; {new Date().getFullYear()} ЛЕВЕЛ 8 ЕООД
        </p>
      </div>
    </main>
  );
}

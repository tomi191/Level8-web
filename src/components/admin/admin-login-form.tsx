"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Невалиден имейл или парола");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="font-mono text-xs text-muted-foreground/70 tracking-wider"
        >
          $ email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@level8.bg"
          required
          autoComplete="email"
          className="bg-background border-border focus:border-neon/50"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="font-mono text-xs text-muted-foreground/70 tracking-wider"
        >
          $ password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="bg-background border-border focus:border-neon/50"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-neon text-primary-foreground hover:bg-neon/90 font-semibold"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <LogIn size={16} className="mr-2" />
        )}
        {loading ? "Влизане..." : "Вход"}
      </Button>
    </form>
  );
}

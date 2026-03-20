"use client";

import { useState, useTransition } from "react";
import { subscribeToBlog } from "@/lib/blog-actions";
import { Mail } from "lucide-react";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    startTransition(async () => {
      try {
        const result = await subscribeToBlog(email.trim());
        if (result.error) {
          setStatus("error");
          setMessage(result.error);
        } else {
          setStatus("success");
          setMessage("Успешно се абонирахте!");
          setEmail("");
        }
      } catch {
        setStatus("error");
        setMessage("Грешка при абонамента. Опитайте отново.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-neon/60" />
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase">
          {"// АБОНАМЕНТ"}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        {"Получавайте новите статии"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {"Без спам. Само полезно съдържание, директно във вашата поща."}
      </p>

      {status === "success" ? (
        <div className="text-sm text-neon font-mono py-2">
          &gt; {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="email@example.com"
            required
            className="flex-1 min-w-0 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon/50 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 bg-neon text-background font-medium text-sm px-4 py-2 rounded-lg hover:bg-neon/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "..." : "Абонирай се"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{message}</p>
      )}
    </div>
  );
}

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
          setMessage("\u0423\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u0435 \u0430\u0431\u043E\u043D\u0438\u0440\u0430\u0445\u0442\u0435!");
          setEmail("");
        }
      } catch {
        setStatus("error");
        setMessage("\u0413\u0440\u0435\u0448\u043A\u0430 \u043F\u0440\u0438 \u0430\u0431\u043E\u043D\u0430\u043C\u0435\u043D\u0442\u0430. \u041E\u043F\u0438\u0442\u0430\u0439\u0442\u0435 \u043E\u0442\u043D\u043E\u0432\u043E.");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={16} className="text-neon/60" />
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase">
          {"// \u0410\u0411\u041E\u041D\u0410\u041C\u0415\u041D\u0422"}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        {"\u041F\u043E\u043B\u0443\u0447\u0430\u0432\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0430\u0442\u0438\u0438"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {"\u0411\u0435\u0437 \u0441\u043F\u0430\u043C. \u0421\u0430\u043C\u043E \u043F\u043E\u043B\u0435\u0437\u043D\u043E \u0441\u044A\u0434\u044A\u0440\u0436\u0430\u043D\u0438\u0435, \u0434\u0438\u0440\u0435\u043A\u0442\u043D\u043E \u0432\u044A\u0432 \u0432\u0430\u0448\u0430\u0442\u0430 \u043F\u043E\u0449\u0430."}
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
            {isPending ? "..." : "\u0410\u0431\u043E\u043D\u0438\u0440\u0430\u0439 \u0441\u0435"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">{message}</p>
      )}
    </div>
  );
}

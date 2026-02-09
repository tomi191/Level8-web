"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitChatContact } from "@/lib/actions";
import { GDPR } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ChatContactFormProps {
  onSubmit: (name: string, phone: string) => void;
}

export function ChatContactForm({ onSubmit }: ChatContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Моля, попълнете и двете полета.");
      return;
    }
    if (!consent) {
      setError(GDPR.consentError);
      return;
    }
    setLoading(true);
    setError("");

    const result = await submitChatContact({
      name: name.trim(),
      phone: phone.trim(),
      consent: true,
    });

    if (result.success) {
      onSubmit(name.trim(), phone.trim());
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-3 mt-2"
    >
      <div>
        <label htmlFor="chat-name" className="sr-only">Вашето име</label>
        <Input
          id="chat-name"
          placeholder="Вашето име"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby={error ? "chat-form-error" : undefined}
          className="bg-background border-border text-sm h-9"
        />
      </div>
      <div>
        <label htmlFor="chat-phone" className="sr-only">Телефон</label>
        <Input
          id="chat-phone"
          placeholder="Телефон"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-describedby={error ? "chat-form-error" : undefined}
          className="bg-background border-border text-sm h-9"
        />
      </div>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-border accent-neon"
        />
        <span className="text-xs text-muted-foreground leading-tight">
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
      {error && <p id="chat-form-error" role="alert" className="text-xs text-destructive">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-neon text-primary-foreground hover:bg-neon/90 text-sm h-9"
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Изпращане...</>
        ) : "Изпрати"}
      </Button>
    </motion.form>
  );
}

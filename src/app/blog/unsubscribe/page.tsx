import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Отписване | ЛЕВЕЛ 8",
  robots: { index: false, follow: false },
};

function getServiceSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let message = "Невалиден линк за отписване.";
  let success = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.UNSUBSCRIBE_JWT_SECRET || "level8-unsubscribe-secret");
      const { payload } = await jwtVerify(token, secret);
      const email = payload.email as string;

      if (email) {
        const supabase = getServiceSupabase();
        const { error } = await supabase
          .from("blog_subscribers")
          .update({
            status: "unsubscribed",
            unsubscribed_at: new Date().toISOString(),
          })
          .eq("email", email);

        if (!error) {
          success = true;
          message = "Успешно се отписахте от блога.";
        }
      }
    } catch {
      // Invalid or expired token
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block mb-4">
          // {success ? "ОТПИСВАНЕ" : "ГРЕШКА"}
        </span>
        <p className={`text-lg ${success ? "text-foreground" : "text-red-400"}`}>
          {message}
        </p>
        <Link
          href="/blog"
          className="inline-block mt-6 text-sm text-neon hover:underline"
        >
          &larr; {"Към блога"}
        </Link>
      </div>
    </div>
  );
}

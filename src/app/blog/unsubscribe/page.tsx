import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "\u041E\u0442\u043F\u0438\u0441\u0432\u0430\u043D\u0435 | \u041B\u0415\u0412\u0415\u041B 8",
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
  let message = "\u041D\u0435\u0432\u0430\u043B\u0438\u0434\u0435\u043D \u043B\u0438\u043D\u043A \u0437\u0430 \u043E\u0442\u043F\u0438\u0441\u0432\u0430\u043D\u0435.";
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
          message = "\u0423\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u0435 \u043E\u0442\u043F\u0438\u0441\u0430\u0445\u0442\u0435 \u043E\u0442 \u0431\u043B\u043E\u0433\u0430.";
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
          // {success ? "\u041E\u0422\u041F\u0418\u0421\u0412\u0410\u041D\u0415" : "\u0413\u0420\u0415\u0428\u041A\u0410"}
        </span>
        <p className={`text-lg ${success ? "text-foreground" : "text-red-400"}`}>
          {message}
        </p>
        <Link
          href="/blog"
          className="inline-block mt-6 text-sm text-neon hover:underline"
        >
          &larr; {"\u041A\u044A\u043C \u0431\u043B\u043E\u0433\u0430"}
        </Link>
      </div>
    </div>
  );
}

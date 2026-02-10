import { Suspense } from "react";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  getSubscriberStats,
  getEmailSubscribers,
  getPushSubscribers,
} from "@/lib/blog-actions";
import { SubscribersContent } from "@/components/admin/subscribers-content";

export default async function SubscribersPage() {
  await requireAdmin();

  const [stats, emailSubs, pushSubs] = await Promise.all([
    getSubscriberStats(),
    getEmailSubscribers(),
    getPushSubscribers(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        <span className="text-neon">//</span> {"Абонати"}
      </h1>
      <Suspense>
        <SubscribersContent
          stats={stats}
          emailSubscribers={emailSubs}
          pushSubscribers={pushSubs}
        />
      </Suspense>
    </div>
  );
}

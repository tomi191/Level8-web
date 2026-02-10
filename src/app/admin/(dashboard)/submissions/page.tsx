import { Suspense } from "react";
import { requireAdmin } from "@/lib/supabase/admin";
import { SubmissionTabs } from "@/components/admin/submission-tabs";
import { SubmissionsTable } from "@/components/admin/submissions-table";
import type { Submission } from "@/types/admin";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const { supabase } = await requireAdmin();
  const { tab = "contact" } = await searchParams;

  // Fetch counts for all tabs
  const [contactCount, leadCount, chatCount] = await Promise.all([
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("type", "contact")
      .eq("is_archived", false),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("type", "lead")
      .eq("is_archived", false),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("type", "chat")
      .eq("is_archived", false),
  ]);

  // Fetch submissions for current tab
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("type", tab)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []) as Submission[];

  return (
    <div className="space-y-6">
      <Suspense>
        <SubmissionTabs
          counts={{
            contact: contactCount.count ?? 0,
            lead: leadCount.count ?? 0,
            chat: chatCount.count ?? 0,
          }}
        >
          <div className="mt-4">
            <SubmissionsTable submissions={submissions} type={tab} />
          </div>
        </SubmissionTabs>
      </Suspense>
    </div>
  );
}

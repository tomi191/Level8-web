"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Json } from "@/types/database";

export async function markSubmissionRead(id: string, read: boolean) {
  const supabase = await createClient();
  await supabase
    .from("submissions")
    .update({ is_read: read, read_at: read ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

export async function archiveSubmission(id: string) {
  const supabase = await createClient();
  await supabase
    .from("submissions")
    .update({ is_archived: true })
    .eq("id", id);
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

export async function deleteSubmission(id: string) {
  const supabase = await createClient();
  await supabase.from("submissions").delete().eq("id", id);
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
}

export async function updateSubmissionNotes(id: string, notes: string) {
  const supabase = await createClient();
  await supabase.from("submissions").update({ notes }).eq("id", id);
  revalidatePath("/admin/submissions");
}

export async function updateSettings(
  key: string,
  value: Record<string, unknown>
) {
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .update({ value: value as unknown as Json, updated_at: new Date().toISOString() })
    .eq("key", key);
  revalidatePath("/admin/settings");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

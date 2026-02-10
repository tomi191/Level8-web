import { requireAdmin } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/settings-form";
import type { GeneralSettings, NotificationSettings } from "@/types/admin";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .in("key", ["general", "notifications"]);

  const general = (settings?.find((s) => s.key === "general")?.value ?? {
    site_name: "ЛЕВЕЛ 8",
    contact_email: "contact@level8.bg",
    phone: "+359 895 552 550",
  }) as unknown as GeneralSettings;

  const notifications = (settings?.find((s) => s.key === "notifications")
    ?.value ?? {
    email_on_contact: true,
    email_on_lead: true,
    email_on_chat: true,
  }) as unknown as NotificationSettings;

  return <SettingsForm general={general} notifications={notifications} />;
}

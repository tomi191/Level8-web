import { requireAdmin } from "@/lib/supabase/admin";
import { ClientForm } from "@/components/admin/crm/client-form";

export default async function NewClientPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <span className="font-mono text-[10px] text-neon/40 tracking-[0.2em] uppercase block">
          // CRM / КЛИЕНТИ / НОВ
        </span>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
          Нов клиент
        </h1>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}

import { requireAdmin } from "@/lib/supabase/admin";
import { getCrmContract } from "@/lib/crm-contracts";
import { generateMaintenanceContractHtml } from "@/lib/contract-templates";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default async function ContractPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const contract = await getCrmContract(id);
  if (!contract) notFound();

  if (contract.type !== "maintenance") {
    return (
      <div className="space-y-6">
        <Link
          href={`/admin/crm/contracts/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Назад
        </Link>
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-muted-foreground">
            Генериране от шаблон е налично само за договори тип{" "}
            <strong>Поддръжка</strong>.
          </p>
          <p className="text-sm text-muted-foreground/50 mt-2">
            За този тип договор, качете готов PDF.
          </p>
        </div>
      </div>
    );
  }

  const html = generateMaintenanceContractHtml(contract);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/crm/contracts/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Назад към договора
        </Link>
        <button
          onClick={undefined}
          className="inline-flex items-center gap-2 rounded-lg border border-neon/20 bg-neon/5 px-4 py-2.5 text-sm font-medium text-neon hover:bg-neon/10 transition-colors print:hidden"
        >
          <Printer size={16} />
          Принтирай / Запази като PDF
        </button>
      </div>

      <div className="text-xs text-muted-foreground/40 font-mono print:hidden">
        $ contract preview --format=a4 --id={contract.contract_number}
      </div>

      {/* Contract HTML preview */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        <iframe
          srcDoc={html}
          className="w-full border-0"
          style={{ height: "calc(100vh - 160px)", minHeight: "800px" }}
          title="Contract Preview"
        />
      </div>
    </div>
  );
}

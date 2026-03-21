"use server";

import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database";
import type {
  CrmContract,
  CrmContractWithClient,
  CrmContractWithAnnexes,
  ContractStatus,
  ExpiringContract,
} from "@/types/crm";
import { contractSchema } from "@/lib/crm-schemas";

// ============================================================
// Auth + Helpers (same pattern as crm-actions.ts)
// ============================================================

async function requireCrmAdmin() {
  const { supabase, user } = await requireAdmin();
  return { db: supabase, user };
}

async function logCrmActivity(
  db: Awaited<ReturnType<typeof requireCrmAdmin>>["db"],
  params: {
    entity_type: string;
    entity_id: string;
    action: string;
    actor: string;
    description?: string;
    changes?: Record<string, { old: unknown; new: unknown }>;
  }
) {
  await db.from("crm_activity_log").insert({
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    action: params.action,
    actor: params.actor,
    description: params.description ?? null,
    changes: (params.changes as Json) ?? null,
  });
}

function cleanEmpty<T extends Record<string, unknown>>(obj: T): T {
  const cleaned = { ...obj };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") {
      (cleaned as Record<string, unknown>)[key] = null;
    }
  }
  return cleaned;
}

// ============================================================
// Zod Schema — imported from crm-schemas.ts (cannot export
// objects from "use server" files)
// ============================================================

// ============================================================
// Client join select string
// ============================================================

const CLIENT_SELECT =
  "*, crm_clients(id, company_name, eik, address, city, contact_person, email)";

// ============================================================
// 1. getCrmContracts
// ============================================================

export async function getCrmContracts(opts?: {
  clientId?: string;
  status?: string;
  type?: string;
  search?: string;
}): Promise<CrmContractWithClient[]> {
  const { db } = await requireCrmAdmin();

  let query = db
    .from("crm_contracts")
    .select(CLIENT_SELECT)
    .eq("is_archived", false)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (opts?.status) {
    query = query.eq("status", opts.status);
  }
  if (opts?.type) {
    query = query.eq("type", opts.type);
  }
  if (opts?.clientId) {
    query = query.eq("client_id", opts.clientId);
  }
  if (opts?.search) {
    query = query.or(
      `title.ilike.%${opts.search}%,contract_number.ilike.%${opts.search}%,crm_clients.company_name.ilike.%${opts.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CrmContractWithClient[];
}

// ============================================================
// 2. getCrmContract
// ============================================================

export async function getCrmContract(
  id: string
): Promise<CrmContractWithClient | null> {
  const { db } = await requireCrmAdmin();

  const { data, error } = await db
    .from("crm_contracts")
    .select(CLIENT_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as CrmContractWithClient;
}

// ============================================================
// 3. getCrmContractWithAnnexes
// ============================================================

export async function getCrmContractWithAnnexes(
  id: string
): Promise<CrmContractWithAnnexes | null> {
  const { db } = await requireCrmAdmin();

  // Get base contract with client
  const { data: contract, error } = await db
    .from("crm_contracts")
    .select(CLIENT_SELECT)
    .eq("id", id)
    .single();

  if (error || !contract) return null;

  // Get annexes
  const { data: annexes } = await db
    .from("crm_contracts")
    .select("*")
    .eq("parent_id", id)
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  return {
    ...(contract as unknown as CrmContractWithClient),
    annexes: (annexes ?? []) as unknown as CrmContract[],
  };
}

// ============================================================
// 4. createCrmContract
// ============================================================

export async function createCrmContract(formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const techStackStr = formData.get("tech_stack_json") as string;
  const parsed = contractSchema.parse({
    ...raw,
    monthly_price: raw.monthly_price
      ? parseFloat(raw.monthly_price as string)
      : undefined,
    hourly_rate: raw.hourly_rate
      ? parseFloat(raw.hourly_rate as string)
      : 0,
    included_hours: raw.included_hours
      ? parseFloat(raw.included_hours as string)
      : 0,
    total_amount: raw.total_amount
      ? parseFloat(raw.total_amount as string)
      : undefined,
    payment_due_day: raw.payment_due_day
      ? parseInt(raw.payment_due_day as string, 10)
      : 10,
    minimum_period_months: raw.minimum_period_months
      ? parseInt(raw.minimum_period_months as string, 10)
      : 6,
    auto_renew: raw.auto_renew === "true",
    tech_stack: techStackStr ? JSON.parse(techStackStr) : [],
  });

  // Get next contract number
  const contractNumber = await getNextContractNumber();

  const cleaned = cleanEmpty(parsed);

  const { data, error } = await db
    .from("crm_contracts")
    .insert({
      ...cleaned,
      contract_number: contractNumber,
      created_date: new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: data.id,
    action: "created",
    actor: user.email || "admin",
    description: `Създаден договор ${contractNumber}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contracts");
  return { success: true, id: data.id, contract_number: contractNumber };
}

// ============================================================
// 5. updateCrmContract
// ============================================================

export async function updateCrmContract(id: string, formData: FormData) {
  const { db, user } = await requireCrmAdmin();

  const raw = Object.fromEntries(formData.entries());
  const techStackStr = formData.get("tech_stack_json") as string;
  const parsed = contractSchema.parse({
    ...raw,
    monthly_price: raw.monthly_price
      ? parseFloat(raw.monthly_price as string)
      : undefined,
    hourly_rate: raw.hourly_rate
      ? parseFloat(raw.hourly_rate as string)
      : 0,
    included_hours: raw.included_hours
      ? parseFloat(raw.included_hours as string)
      : 0,
    total_amount: raw.total_amount
      ? parseFloat(raw.total_amount as string)
      : undefined,
    payment_due_day: raw.payment_due_day
      ? parseInt(raw.payment_due_day as string, 10)
      : 10,
    minimum_period_months: raw.minimum_period_months
      ? parseInt(raw.minimum_period_months as string, 10)
      : 6,
    auto_renew: raw.auto_renew === "true",
    tech_stack: techStackStr ? JSON.parse(techStackStr) : [],
  });

  const cleaned = cleanEmpty(parsed);

  const { error } = await db
    .from("crm_contracts")
    .update(cleaned)
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: id,
    action: "updated",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contracts");
  revalidatePath(`/admin/crm/contracts/${id}`);
  return { success: true };
}

// ============================================================
// 6. archiveCrmContract
// ============================================================

export async function archiveCrmContract(id: string) {
  const { db, user } = await requireCrmAdmin();

  await db.from("crm_contracts").update({ is_archived: true }).eq("id", id);

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: id,
    action: "archived",
    actor: user.email || "admin",
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contracts");
}

// ============================================================
// 7. updateContractStatus
// ============================================================

export async function updateContractStatus(
  id: string,
  status: ContractStatus,
  dateField?: string
) {
  const { db, user } = await requireCrmAdmin();

  const today = new Date().toISOString().split("T")[0];
  const updateData: Record<string, unknown> = { status };

  // Set corresponding date field based on status
  switch (status) {
    case "sent":
      updateData.sent_date = today;
      break;
    case "signed":
      updateData.signed_date = today;
      break;
    case "active": {
      // Only set effective_date if not already set
      const { data: existing } = await db
        .from("crm_contracts")
        .select("effective_date")
        .eq("id", id)
        .single();
      if (!existing?.effective_date) {
        updateData.effective_date = today;
      }
      break;
    }
    case "terminated":
      updateData.terminated_date = today;
      break;
  }

  // Allow custom date field override
  if (dateField) {
    updateData[dateField] = today;
  }

  const { error } = await db
    .from("crm_contracts")
    .update(updateData)
    .eq("id", id);

  if (error) throw new Error(error.message);

  const statusLabels: Record<ContractStatus, string> = {
    draft: "Чернова",
    sent: "Изпратен",
    signed: "Подписан",
    active: "Активен",
    expired: "Изтекъл",
    terminated: "Прекратен",
  };

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: id,
    action: "status_changed",
    actor: user.email || "admin",
    description: `Статус променен на: ${statusLabels[status] || status}`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contracts");
  revalidatePath(`/admin/crm/contracts/${id}`);
}

// ============================================================
// 8. uploadContractPdf
// ============================================================

export async function uploadContractPdf(
  contractId: string,
  formData: FormData
) {
  const { db, user } = await requireCrmAdmin();

  const file = formData.get("pdf") as File;
  if (!file || file.size === 0) throw new Error("Не е избран файл");
  if (file.type !== "application/pdf")
    throw new Error("Файлът трябва да е PDF");
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Файлът е твърде голям (макс. 10MB)");

  // Fetch contract to get contract_number for filename
  const { data: contract } = await db
    .from("crm_contracts")
    .select("contract_number")
    .eq("id", contractId)
    .single();

  if (!contract) throw new Error("Договорът не е намерен");

  const filename = contract.contract_number || contractId;
  const storagePath = `${contractId}/${filename}.pdf`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await db.storage
    .from("crm-contracts")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError)
    throw new Error(`Грешка при качване: ${uploadError.message}`);

  // Save path to contract record
  await db
    .from("crm_contracts")
    .update({ pdf_url: storagePath })
    .eq("id", contractId);

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: contractId,
    action: "updated",
    actor: user.email || "admin",
    description: `PDF качен: ${filename}.pdf`,
  });

  revalidatePath("/admin/crm/contracts");
  revalidatePath(`/admin/crm/contracts/${contractId}`);
}

// ============================================================
// 9. deleteContractPdf
// ============================================================

export async function deleteContractPdf(contractId: string) {
  const { db, user } = await requireCrmAdmin();

  const { data: contract } = await db
    .from("crm_contracts")
    .select("pdf_url, contract_number")
    .eq("id", contractId)
    .single();

  if (!contract?.pdf_url) throw new Error("Няма качен PDF");

  await db.storage.from("crm-contracts").remove([contract.pdf_url]);

  await db
    .from("crm_contracts")
    .update({ pdf_url: null })
    .eq("id", contractId);

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: contractId,
    action: "updated",
    actor: user.email || "admin",
    description: `PDF изтрит: ${contract.contract_number || contractId}.pdf`,
  });

  revalidatePath("/admin/crm/contracts");
  revalidatePath(`/admin/crm/contracts/${contractId}`);
}

// ============================================================
// 10. getContractsForClient
// ============================================================

export async function getContractsForClient(
  clientId: string
): Promise<CrmContract[]> {
  const { db } = await requireCrmAdmin();

  const { data, error } = await db
    .from("crm_contracts")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CrmContract[];
}

// ============================================================
// 11. getExpiringContracts
// ============================================================

export async function getExpiringContracts(): Promise<ExpiringContract[]> {
  const { db } = await requireCrmAdmin();

  // Query contracts expiring within 90 days or already expired
  // Since crm_expiring_contracts view may not exist yet, compute inline
  const today = new Date().toISOString().split("T")[0];
  const in90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data, error } = await db
    .from("crm_contracts")
    .select("id, client_id, contract_number, title, type, status, expiry_date, crm_clients(company_name)")
    .eq("is_archived", false)
    .is("parent_id", null)
    .not("expiry_date", "is", null)
    .lte("expiry_date", in90Days)
    .in("status", ["active", "signed"])
    .order("expiry_date", { ascending: true })
    .limit(20);

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Array<{
    id: string;
    client_id: string;
    contract_number: string | null;
    title: string;
    type: string;
    status: string;
    expiry_date: string;
    crm_clients: { company_name: string };
  }>).map((row) => {
    const expiryDate = new Date(row.expiry_date);
    const todayDate = new Date(today);
    const daysUntil = Math.ceil(
      (expiryDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let urgency: ExpiringContract["urgency"];
    if (daysUntil < 0) urgency = "expired";
    else if (daysUntil <= 14) urgency = "critical";
    else if (daysUntil <= 30) urgency = "warning";
    else urgency = "ok";

    return {
      id: row.id,
      client_id: row.client_id,
      company_name: row.crm_clients?.company_name || "",
      contract_number: row.contract_number,
      title: row.title,
      type: row.type as ExpiringContract["type"],
      status: row.status as ExpiringContract["status"],
      expiry_date: row.expiry_date,
      urgency,
    };
  });
}

// ============================================================
// 12. getNextContractNumber
// ============================================================

export async function getNextContractNumber(): Promise<string> {
  const { db } = await requireCrmAdmin();

  try {
    const { data } = await db.rpc("crm_next_contract_number");
    if (data) return data as string;
  } catch {
    // RPC may not exist yet — fallback to manual generation
  }

  // Fallback: generate based on existing contracts
  const year = new Date().getFullYear();
  const { count } = await db
    .from("crm_contracts")
    .select("*", { count: "exact", head: true })
    .ilike("contract_number", `L8C-${year}-%`);

  const next = (count || 0) + 1;
  return `L8C-${year}-${String(next).padStart(4, "0")}`;
}

// ============================================================
// 13. createServiceFromContract
// ============================================================

export async function createServiceFromContract(
  contractId: string
): Promise<string> {
  const { db, user } = await requireCrmAdmin();

  // Fetch the contract
  const { data: contract, error: fetchError } = await db
    .from("crm_contracts")
    .select("*")
    .eq("id", contractId)
    .single();

  if (fetchError || !contract)
    throw new Error("Договорът не е намерен");

  const c = contract as unknown as CrmContract;

  // Map contract type to service type
  const serviceTypeMap: Record<string, string> = {
    maintenance: "maintenance",
    development: "development",
    audit: "other",
    other: "other",
  };

  // Determine billing cycle from variant
  const billingCycle = "monthly";

  const startDate =
    c.effective_date || new Date().toISOString().split("T")[0];

  const { data: service, error: insertError } = await db
    .from("crm_client_services")
    .insert({
      client_id: c.client_id,
      website_id: c.website_id,
      name: c.title,
      service_type: serviceTypeMap[c.type] || "other",
      price: c.monthly_price || 0,
      currency: c.currency,
      billing_cycle: billingCycle,
      start_date: startDate,
      next_billing_date: startDate,
      auto_renew: c.auto_renew,
      status: "active",
      metadata: { contract_id: contractId } as unknown as Json,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  await logCrmActivity(db, {
    entity_type: "service",
    entity_id: service.id,
    action: "created",
    actor: user.email || "admin",
    description: `Услуга създадена от договор ${c.contract_number || contractId}`,
  });

  await logCrmActivity(db, {
    entity_type: "contract",
    entity_id: contractId,
    action: "updated",
    actor: user.email || "admin",
    description: `Услуга ${service.id} създадена от договора`,
  });

  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/contracts");
  revalidatePath(`/admin/crm/contracts/${contractId}`);
  revalidatePath("/admin/crm/services");
  return service.id;
}

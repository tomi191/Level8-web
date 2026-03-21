# CRM Contracts Module — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a contracts module to the CRM with base contracts, annexes, template generation, PDF upload, and billing chain integration.

**Architecture:** New `crm_contracts` table with self-referencing `parent_id` for annexes. Server actions in `crm-contracts.ts`. HTML template generation using existing print CSS. Linked to services via `contract_id` FK. Notifications via existing `admin-notifications.ts`.

**Tech Stack:** Next.js 16, Supabase, TypeScript, Tailwind v4, Lucide icons, existing CRM patterns.

---

### Task 1: SQL Migration

**Files:**
- Create: `supabase/migrations/20260321_crm_contracts.sql`

**Step 1: Write migration SQL**

```sql
-- crm_contracts table
CREATE TABLE IF NOT EXISTS crm_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES crm_clients(id),
  website_id UUID REFERENCES crm_websites(id),
  parent_id UUID REFERENCES crm_contracts(id),
  contract_number TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('maintenance', 'development', 'audit', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'signed', 'active', 'expired', 'terminated')),
  variant TEXT CHECK (variant IN ('a', 'b')),
  monthly_price NUMERIC,
  hourly_rate NUMERIC DEFAULT 40,
  included_hours INTEGER DEFAULT 0,
  total_amount NUMERIC,
  currency TEXT DEFAULT 'EUR',
  payment_due_day INTEGER DEFAULT 10,
  minimum_period_months INTEGER DEFAULT 6,
  auto_renew BOOLEAN DEFAULT true,
  created_date DATE,
  sent_date DATE,
  signed_date DATE,
  effective_date DATE,
  expiry_date DATE,
  terminated_date DATE,
  platform_name TEXT,
  platform_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_crm_contracts_client ON crm_contracts(client_id);
CREATE INDEX idx_crm_contracts_parent ON crm_contracts(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_crm_contracts_status ON crm_contracts(status, expiry_date);

-- RLS
ALTER TABLE crm_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access on crm_contracts" ON crm_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto contract number
CREATE OR REPLACE FUNCTION crm_next_contract_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE next_num INTEGER; result TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 'L8-D-\d{4}-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num FROM crm_contracts
    WHERE contract_number LIKE 'L8-D-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';
  result := 'L8-D-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN result;
END; $$;

-- Expiring contracts view
CREATE OR REPLACE VIEW crm_expiring_contracts AS
SELECT c.*, cl.company_name,
  CASE
    WHEN c.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN c.expiry_date <= CURRENT_DATE + 7 THEN 'critical'
    WHEN c.expiry_date <= CURRENT_DATE + 30 THEN 'warning'
    ELSE 'ok'
  END AS urgency
FROM crm_contracts c
JOIN crm_clients cl ON cl.id = c.client_id
WHERE NOT c.is_archived AND c.expiry_date IS NOT NULL
  AND c.expiry_date <= CURRENT_DATE + 90
  AND c.status IN ('active', 'signed')
ORDER BY c.expiry_date ASC;

-- Add contract_id FK to services
ALTER TABLE crm_client_services ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES crm_contracts(id);
```

**Step 2: Run migration via Supabase MCP tool**

**Step 3: Commit**
```
git add supabase/migrations/20260321_crm_contracts.sql
git commit -m "feat(crm): add contracts table, view, and auto-numbering function"
```

---

### Task 2: TypeScript Types

**Files:**
- Modify: `src/types/crm.ts` (add contract types after BillingPipelineData)
- Modify: `src/types/database.ts` (add crm_contracts table type)

**Step 1: Add types to crm.ts**

Add after BillingPipelineData:
```typescript
// --- Contract Types ---
export type ContractType = "maintenance" | "development" | "audit" | "other";
export type ContractStatus = "draft" | "sent" | "signed" | "active" | "expired" | "terminated";
export type ContractVariant = "a" | "b";

export interface CrmContract {
  id: string;
  client_id: string;
  website_id: string | null;
  parent_id: string | null;
  contract_number: string | null;
  type: ContractType;
  title: string;
  description: string | null;
  status: ContractStatus;
  variant: ContractVariant | null;
  monthly_price: number | null;
  hourly_rate: number;
  included_hours: number;
  total_amount: number | null;
  currency: string;
  payment_due_day: number;
  minimum_period_months: number;
  auto_renew: boolean;
  created_date: string | null;
  sent_date: string | null;
  signed_date: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  terminated_date: string | null;
  platform_name: string | null;
  platform_url: string | null;
  tech_stack: string[];
  pdf_url: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmContractWithClient extends CrmContract {
  crm_clients: Pick<CrmClient, "id" | "company_name" | "eik" | "address" | "city" | "contact_person" | "email">;
}

export interface CrmContractWithAnnexes extends CrmContractWithClient {
  annexes: CrmContract[];
}

export interface ExpiringContract {
  id: string;
  client_id: string;
  company_name: string;
  contract_number: string | null;
  title: string;
  type: ContractType;
  status: ContractStatus;
  expiry_date: string;
  urgency: "expired" | "critical" | "warning" | "ok";
}
```

**Step 2: Add table definition to database.ts** (same pattern as admin_notifications)

**Step 3: Commit**

---

### Task 3: Server Actions (`crm-contracts.ts`)

**Files:**
- Create: `src/lib/crm-contracts.ts`

**Actions to implement:**
- `getCrmContracts(opts?)` — list with filters (status, type, clientId, search)
- `getCrmContract(id)` — single with client join
- `getCrmContractWithAnnexes(id)` — with annexes array
- `createCrmContract(formData)` — auto contract_number via RPC
- `updateCrmContract(id, formData)`
- `archiveCrmContract(id)`
- `updateContractStatus(id, status, date?)` — status transitions
- `uploadContractPdf(contractId, formData)` — PDF upload to crm-contracts bucket
- `deleteContractPdf(contractId)`
- `getContractsForClient(clientId)` — all contracts + annexes for client detail
- `getExpiringContracts()` — from view
- `getNextContractNumber()` — RPC call
- `createServiceFromContract(contractId)` — pre-fill service from contract data

**Pattern:** Follow exact same patterns as `crm-actions.ts` — `requireCrmAdmin()`, `logCrmActivity()`, `cleanEmpty()`, `revalidatePath()`.

**Step 1:** Create file with all actions
**Step 2:** Type-check: `npx tsc --noEmit`
**Step 3:** Commit

---

### Task 4: Contract Form Component

**Files:**
- Create: `src/components/admin/crm/contract-form.tsx`

**Props:**
```typescript
interface ContractFormProps {
  contract?: CrmContractWithClient;  // undefined for create
  clients: Pick<CrmClient, "id" | "company_name">[];
  websites: Pick<CrmWebsite, "id" | "domain" | "client_id">[];
  parentId?: string;  // if creating an annex
}
```

**Fields:**
- Client select (required)
- Website select (filtered by selected client)
- Type select: Поддръжка / Разработка / Одит / Друго
- Title (auto-generated from type + client, editable)
- Variant A/B (shown only for maintenance)
- Monthly price / Total amount (conditional on type)
- Hourly rate, Included hours
- Currency, Payment due day
- Minimum period, Auto-renew
- Platform name, Platform URL, Tech stack (tags input)
- Effective date, Expiry date
- Description (textarea)
- Notes

**Pattern:** Same as `invoice-form.tsx` — FormData, client-side calculation, server action submit.

---

### Task 5: Contract Detail Component

**Files:**
- Create: `src/components/admin/crm/contract-detail.tsx`

**Sections:**
1. **Header:** Contract number + status badge + type badge
2. **Dates timeline:** Created → Sent → Signed → Active → Expiry (visual timeline)
3. **Parties:** АБОНАТ (client info) | ИЗПЪЛНИТЕЛ (Level 8 info) — 2-column
4. **Terms:** Price, variant, hourly rate, hours, period — in terminal-style card
5. **Platform:** Name, URL, tech stack tags
6. **Annexes tree:** List of child contracts with status + actions
7. **Linked services:** Services with contract_id = this contract
8. **PDF section:** Upload/View/Delete buttons
9. **Actions:** Edit, Change status, Add annex, Create service, Generate preview
10. **Activity log:** From crm_activity_log filtered by entity

---

### Task 6: Contract List Component

**Files:**
- Create: `src/components/admin/crm/contract-list.tsx`

**Features:**
- Filter by status (all, draft, active, expired)
- Filter by type (all, maintenance, development, audit)
- Search by title, client name, contract number
- Table columns: Number, Client, Type, Status, Monthly/Total, Expiry, Actions
- Status badges: color-coded (green=active, blue=signed, amber=draft, red=expired)

---

### Task 7: Page Routes

**Files:**
- Create: `src/app/admin/(dashboard)/crm/contracts/page.tsx`
- Create: `src/app/admin/(dashboard)/crm/contracts/new/page.tsx`
- Create: `src/app/admin/(dashboard)/crm/contracts/[id]/page.tsx`
- Create: `src/app/admin/(dashboard)/crm/contracts/[id]/edit/page.tsx`

**Pattern:** Same as invoices pages — `requireAdmin()`, data fetch, render component.

---

### Task 8: HTML Template Generation

**Files:**
- Create: `src/lib/contract-templates.ts`

**Functions:**
- `generateMaintenanceContractHtml(contract, client)` — full A4 HTML using existing dogovor-print.html CSS pattern
- `generateDevelopmentContractHtml(contract, client)` — legal skeleton + scope section

**Template data auto-fill from CRM:**
- Client: company_name, eik, city, address, contact_person
- Contract: variant, monthly_price, hourly_rate, included_hours, payment_due_day
- Platform: platform_name, platform_url, tech_stack
- Dates: effective_date, minimum_period_months

---

### Task 9: Preview Page

**Files:**
- Create: `src/app/admin/(dashboard)/crm/contracts/[id]/preview/page.tsx`

**Design:** Full-width page with print-optimized HTML in iframe + "Print" button.

---

### Task 10: Sidebar + Dashboard Integration

**Files:**
- Modify: `src/components/admin/admin-sidebar.tsx` — add Договори link to CRM_LINKS
- Modify: `src/components/admin/admin-header.tsx` — add breadcrumb for contracts
- Modify: `src/app/admin/(dashboard)/crm/page.tsx` — add expiring contracts stats

---

### Task 11: Contract Expiry Notifications

**Files:**
- Modify: `src/app/api/cron/billing-reminders/route.ts` — add PART 4 for contract expiry

**Add after domain/SSL section:**
- Query `crm_expiring_contracts` view
- Send notifications at 90/30/14/7/0 days
- Same severity pattern as domains

---

### Task 12: Final Integration + Push

**Step 1:** Type-check: `npx tsc --noEmit`
**Step 2:** Git add all new files
**Step 3:** Commit with descriptive message
**Step 4:** Push to origin/master

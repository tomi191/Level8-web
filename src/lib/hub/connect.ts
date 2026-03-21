import { decrypt } from "./crypto";
import type { HubSchemaTable, HubSchemaColumn } from "@/types/crm";

/**
 * Test connection to a remote Supabase project.
 */
export async function testConnection(
  projectUrl: string,
  serviceRoleKey: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${projectUrl}/rest/v1/`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

/**
 * Discover schema via PostgREST OpenAPI endpoint.
 * The root endpoint returns an OpenAPI spec with all table definitions.
 */
export async function discoverSchema(
  projectUrl: string,
  encryptedKey: string
): Promise<HubSchemaTable[]> {
  const serviceRoleKey = decrypt(encryptedKey);

  // PostgREST root returns OpenAPI spec
  const res = await fetch(`${projectUrl}/rest/v1/`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Schema discovery failed: ${res.status}`);
  }

  const openApi = await res.json();
  const definitions = openApi.definitions || {};

  // Filter out internal tables
  const tableNames = Object.keys(definitions).filter(
    (name) =>
      !name.startsWith("pg_") &&
      !name.startsWith("_") &&
      !name.startsWith("schema_") &&
      !name.startsWith("information_schema")
  );

  const tables: HubSchemaTable[] = [];

  for (const tableName of tableNames) {
    const def = definitions[tableName];
    const columns: HubSchemaColumn[] = Object.entries(
      (def?.properties || {}) as Record<string, any>
    ).map(([colName, colDef]) => ({
      name: colName,
      data_type: colDef.format || colDef.type || "unknown",
      is_nullable: !(def.required || []).includes(colName),
      column_default: colDef.default ?? null,
    }));

    // Get row count with HEAD request
    let rowCount = 0;
    try {
      const countRes = await fetch(
        `${projectUrl}/rest/v1/${encodeURIComponent(tableName)}?select=*`,
        {
          method: "HEAD",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: "count=exact",
          },
        }
      );
      const contentRange = countRes.headers.get("content-range");
      if (contentRange) {
        const total = contentRange.split("/")[1];
        rowCount = total && total !== "*" ? parseInt(total, 10) : 0;
      }
    } catch {
      // Row count is best-effort
    }

    tables.push({ name: tableName, columns, row_count: rowCount });
  }

  return tables;
}

/**
 * Browse table data from a remote project (read-only, paginated).
 */
export async function browseTable(
  projectUrl: string,
  encryptedKey: string,
  tableName: string,
  page = 0,
  pageSize = 25
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const serviceRoleKey = decrypt(encryptedKey);

  // Validate table name to prevent injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new Error("Invalid table name");
  }

  const offset = page * pageSize;

  // Try ordering by created_at first, fallback to no order
  let res = await fetch(
    `${projectUrl}/rest/v1/${encodeURIComponent(tableName)}?select=*&order=created_at.desc.nullsfirst&offset=${offset}&limit=${pageSize}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
      },
    }
  );

  if (!res.ok) {
    res = await fetch(
      `${projectUrl}/rest/v1/${encodeURIComponent(tableName)}?select=*&offset=${offset}&limit=${pageSize}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "count=exact",
        },
      }
    );
    if (!res.ok) throw new Error(`Browse failed: ${res.status}`);
  }

  const rows = await res.json();
  const contentRange = res.headers.get("content-range");
  const total = contentRange
    ? parseInt(contentRange.split("/")[1] || "0", 10)
    : rows.length;

  return { rows, total };
}

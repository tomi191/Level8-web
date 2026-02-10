/**
 * Supabase Adapters for Content Engine
 * Implements StorageAdapter, DatabaseAdapter, and LogAdapter using Supabase
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StorageAdapter, DatabaseAdapter, LogAdapter } from "./types";

// Lazy-init service-role client (same pattern as actions.ts)
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (
    !_supabase &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  if (!_supabase) {
    throw new Error("Supabase not configured — missing URL or service role key");
  }
  return _supabase;
}

export const supabaseStorage: StorageAdapter = {
  async upload(
    bucket: string,
    path: string,
    data: Buffer,
    contentType: string
  ): Promise<string> {
    const sb = getSupabase();
    const { error } = await sb.storage.from(bucket).upload(path, data, {
      contentType,
      upsert: true,
    });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const {
      data: { publicUrl },
    } = sb.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },
};

export const supabaseDatabase: DatabaseAdapter = {
  async insert(table: string, data: Record<string, unknown>): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb.from(table).insert(data);
    if (error) throw new Error(`DB insert into ${table} failed: ${error.message}`);
  },

  async update(
    table: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb.from(table).update(data).eq("id", id);
    if (error) throw new Error(`DB update ${table}/${id} failed: ${error.message}`);
  },

  async query(
    table: string,
    filters: Record<string, unknown>
  ): Promise<unknown[]> {
    const sb = getSupabase();
    let q = sb.from(table).select("*");
    for (const [key, value] of Object.entries(filters)) {
      q = q.eq(key, value as string);
    }
    const { data, error } = await q;
    if (error) throw new Error(`DB query ${table} failed: ${error.message}`);
    return data || [];
  },
};

export const consoleLogger: LogAdapter = {
  info: (msg, data) => console.log(`[ContentEngine] ${msg}`, data || ""),
  warn: (msg, data) => console.warn(`[ContentEngine] ${msg}`, data || ""),
  error: (msg, data) => console.error(`[ContentEngine] ${msg}`, data || ""),
};

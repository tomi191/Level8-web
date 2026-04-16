import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/instagram/revalidate
 * Принудително обновява кеша на Instagram feed. Изисква admin session.
 */
export async function POST(_request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("instagram-feed");
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
}

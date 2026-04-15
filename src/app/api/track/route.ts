import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface TrackPayload {
  session_id?: string;
  path?: string;
  title?: string;
  initial_page?: string | null;
  initial_referrer?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

export async function POST(request: NextRequest) {
  let payload: TrackPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = payload.session_id?.trim();
  const path = payload.path?.trim();
  if (!sessionId || !path) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Basic bot filter — skip known crawlers
  const ua = payload.user_agent || "";
  if (/bot|crawl|spider|slurp|preview/i.test(ua)) {
    return NextResponse.json({ ok: true, skipped: "bot" });
  }

  const db = getServiceClient();
  const country = request.headers.get("x-vercel-ip-country") || null;
  const now = new Date().toISOString();

  // Fetch existing session
  const { data: existing } = await db
    .from("visitor_sessions")
    .select("id, page_views, page_view_count")
    .eq("session_id", sessionId)
    .maybeSingle();

  const newPageView = {
    path,
    title: payload.title || null,
    timestamp: now,
  };

  if (existing) {
    // Update: append page view, bump counters
    const pageViews = Array.isArray(existing.page_views) ? existing.page_views : [];
    // Dedup consecutive same-path visits (SPA navigations trigger double)
    const last = pageViews[pageViews.length - 1] as { path?: string } | undefined;
    const updatedPageViews = last?.path === path ? pageViews : [...pageViews, newPageView];

    await db
      .from("visitor_sessions")
      .update({
        last_activity_at: now,
        page_views: updatedPageViews,
        page_view_count: updatedPageViews.length,
      })
      .eq("id", existing.id);
  } else {
    // Insert: new session
    await db.from("visitor_sessions").insert({
      session_id: sessionId,
      first_visit_at: now,
      last_activity_at: now,
      initial_page: payload.initial_page || path,
      initial_referrer: payload.initial_referrer || payload.referrer || null,
      utm_source: payload.utm_source || null,
      utm_medium: payload.utm_medium || null,
      utm_campaign: payload.utm_campaign || null,
      utm_content: payload.utm_content || null,
      utm_term: payload.utm_term || null,
      user_agent: ua || null,
      country,
      page_views: [newPageView],
      page_view_count: 1,
    });
  }

  return NextResponse.json({ ok: true });
}

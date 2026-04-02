import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUnreadNotifications,
  getUnreadCount,
} from "@/lib/admin-notifications";

/**
 * GET /api/admin/notifications
 * Returns unread notifications for the notification bell polling.
 */
export async function GET() {
  // Auth check — only authenticated admin users
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [notifications, count] = await Promise.all([
      getUnreadNotifications(15),
      getUnreadCount(),
    ]);
    return NextResponse.json({ notifications, count });
  } catch {
    return NextResponse.json(
      { notifications: [], count: 0 },
      { status: 500 }
    );
  }
}

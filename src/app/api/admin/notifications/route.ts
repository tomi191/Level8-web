import { NextResponse } from "next/server";
import {
  getUnreadNotifications,
  getUnreadCount,
} from "@/lib/admin-notifications";

/**
 * GET /api/admin/notifications
 * Returns unread notifications for the notification bell polling.
 */
export async function GET() {
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

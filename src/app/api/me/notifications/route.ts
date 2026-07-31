import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { requireUser } from "@/lib/apiAuth";

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  await connectDB();
  const userId = session!.user.id;

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, read: false });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const { error, session } = await requireUser();
  if (error) return error;

  await connectDB();
  const userId = session!.user.id;
  const body = await req.json().catch(() => ({}));

  if (body.all) {
    await Notification.updateMany({ userId, read: false }, { read: true });
  } else if (body.id) {
    await Notification.updateOne({ _id: body.id, userId }, { read: true });
  }

  return NextResponse.json({ success: true });
}

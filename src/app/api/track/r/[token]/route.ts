import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SimulationResult from "@/lib/models/SimulationResult";
import Notification from "@/lib/models/Notification";
import Badge from "@/lib/models/Badge";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await connectDB();
  const target = await SimulationResult.findOneAndUpdate(
    { token, reportedAt: null },
    { $set: { reportedAt: new Date() } },
    { new: true }
  );

  if (!target) {
    return NextResponse.json({ error: "Invalid or already reported" }, { status: 404 });
  }

  // Award first_report badge & create notification
  try {
    const userId = target.userId;
    try {
      await Badge.create({ userId, badgeType: "first_report" });
    } catch {
      // Badge already awarded
    }

    // Check for phish_survivor (3+ simulations, 0 clicks)
    const totalSims = await SimulationResult.countDocuments({ userId, emailSentAt: { $ne: null } });
    const clickedSims = await SimulationResult.countDocuments({ userId, clickedAt: { $ne: null } });
    if (totalSims >= 3 && clickedSims === 0) {
      try {
        await Badge.create({ userId, badgeType: "phish_survivor" });
      } catch {
        // Badge already awarded
      }
    }

    await Notification.create({
      userId,
      type: "badge_earned",
      title: "Great Catch! 🛡️",
      message: "You correctly spotted and reported a phishing email. Keep up the sharp defense!",
    });
  } catch (err) {
    console.error("Error creating report notification:", err);
  }

  return NextResponse.json({ success: true });
}

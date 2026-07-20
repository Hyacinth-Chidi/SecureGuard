import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CampaignTarget from "@/lib/models/CampaignTarget";

// This endpoint intentionally ignores any submitted form fields. The
// simulated phishing landing page never harvests real credentials — we only
// record the fact that a submission attempt happened, for training metrics.
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await connectDB();
  const target = await CampaignTarget.findOneAndUpdate(
    { token, submittedAt: null },
    { $set: { submittedAt: new Date() } },
    { new: true }
  );

  if (!target) {
    return NextResponse.json({ error: "Invalid or already recorded" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

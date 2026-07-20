import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CampaignTarget from "@/lib/models/CampaignTarget";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await connectDB();
  const target = await CampaignTarget.findOneAndUpdate(
    { token, reportedAt: null },
    { $set: { reportedAt: new Date() } },
    { new: true }
  );

  if (!target) {
    return NextResponse.json({ error: "Invalid or already reported" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

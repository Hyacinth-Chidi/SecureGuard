import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const campaign = await Campaign.findById(id).populate("templateId").lean();
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targets = await CampaignTarget.find({ campaignId: id }).populate("userId", "name email department").lean();

  return NextResponse.json({ campaign, targets });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  await Campaign.findByIdAndDelete(id);
  await CampaignTarget.deleteMany({ campaignId: id });
  return NextResponse.json({ success: true });
}

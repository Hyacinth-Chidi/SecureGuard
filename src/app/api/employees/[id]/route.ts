import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import CampaignTarget from "@/lib/models/CampaignTarget";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin } from "@/lib/apiAuth";
import { computeRiskScore } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const employee = await User.findById(id).lean();
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targets = await CampaignTarget.find({ userId: id })
    .populate({ path: "campaignId", select: "name status createdAt" })
    .sort({ createdAt: -1 })
    .lean();

  const trainingProgress = await TrainingProgress.find({ userId: id })
    .populate("moduleId", "title category")
    .sort({ updatedAt: -1 })
    .lean();

  const stats = {
    totalCampaigns: targets.length,
    clicked: targets.filter((t) => t.clickedAt).length,
    submitted: targets.filter((t) => t.submittedAt).length,
    reported: targets.filter((t) => t.reportedAt).length,
  };

  return NextResponse.json({
    employee,
    targets,
    trainingProgress,
    riskScore: computeRiskScore(stats),
    stats,
  });
}

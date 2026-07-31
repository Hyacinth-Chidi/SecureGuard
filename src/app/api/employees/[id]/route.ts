import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import CampaignTarget from "@/lib/models/CampaignTarget";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin } from "@/lib/apiAuth";
import { buildTenantScopedQuery } from "@/lib/organizationScope";
import { computeRiskScore } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const employee = await User.findOne({ _id: id, organizationId: session!.user.organizationId }).lean();
  if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targets = await CampaignTarget.find(
    buildTenantScopedQuery({ userId: id }, session!.user.organizationId, { userId: id })
  )
    .populate({ path: "campaignId", select: "name status createdAt" })
    .sort({ createdAt: -1 })
    .lean();

  const trainingProgress = await TrainingProgress.find(
    buildTenantScopedQuery({ userId: id }, session!.user.organizationId, { userId: id })
  )
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

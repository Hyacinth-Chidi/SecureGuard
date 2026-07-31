import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CampaignTarget from "@/lib/models/CampaignTarget";
import TrainingProgress from "@/lib/models/TrainingProgress";
import TrainingModule from "@/lib/models/TrainingModule";
import User from "@/lib/models/User";
import { requireUser } from "@/lib/apiAuth";
import { buildTenantScopedQuery } from "@/lib/organizationScope";
import { computeRiskScore } from "@/lib/utils";

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  await connectDB();
  const userId = session!.user.id;
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");

  const targets = await CampaignTarget.find({ userId, emailSentAt: { $ne: null } })
    .populate({ path: "campaignId", select: "name templateId", populate: { path: "templateId", select: "subject fromName" } })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const stats = {
    totalCampaigns: await CampaignTarget.countDocuments({ userId, emailSentAt: { $ne: null } }),
    clicked: await CampaignTarget.countDocuments({ userId, clickedAt: { $ne: null } }),
    submitted: await CampaignTarget.countDocuments({ userId, submittedAt: { $ne: null } }),
    reported: await CampaignTarget.countDocuments({ userId, reportedAt: { $ne: null } }),
  };

  const totalModules = await TrainingModule.countDocuments(
    buildTenantScopedQuery(
      { published: true },
      organizationId,
      { published: true, createdBy: { $in: adminIds.map((admin) => admin._id) } }
    )
  );
  const completedModules = await TrainingProgress.countDocuments({ userId, status: "completed" });

  return NextResponse.json({
    riskScore: computeRiskScore(stats),
    stats,
    recentEmails: targets,
    training: { total: totalModules, completed: completedModules },
  });
}

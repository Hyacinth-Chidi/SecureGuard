import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import User from "@/lib/models/User";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin } from "@/lib/apiAuth";
import Template from "@/lib/models/Template";
import { buildTenantScopedQuery } from "@/lib/organizationScope";
import { computeRiskScore } from "@/lib/utils";

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const organizationId = session!.user.organizationId;
  const [adminDocs, employeeDocs] = await Promise.all([
    User.find({ organizationId, role: "org_admin" }, "_id").lean(),
    User.find({ organizationId, role: "employee" }, "_id name email department").lean(),
  ]);
  const adminIds = adminDocs.map((admin) => admin._id);
  const employeeIds = employeeDocs.map((employee) => employee._id);

  const [totalCampaigns, totalEmployees, totalTemplates, totalModules] = await Promise.all([
    Campaign.countDocuments(buildTenantScopedQuery({}, organizationId, { createdBy: { $in: adminIds } })),
    User.countDocuments({ organizationId, role: "employee" }),
    Template.countDocuments(buildTenantScopedQuery({}, organizationId, { createdBy: { $in: adminIds } })),
    TrainingModule.countDocuments(buildTenantScopedQuery({}, organizationId, { createdBy: { $in: adminIds } })),
  ]);

  const overallStats = await CampaignTarget.aggregate([
    { $match: { userId: { $in: employeeIds } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $ne: ["$emailSentAt", null] }, 1, 0] } },
        opened: { $sum: { $cond: [{ $ne: ["$openedAt", null] }, 1, 0] } },
        clicked: { $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] } },
        submitted: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
        reported: { $sum: { $cond: [{ $ne: ["$reportedAt", null] }, 1, 0] } },
      },
    },
  ]);
  const stats = overallStats[0] ?? { total: 0, sent: 0, opened: 0, clicked: 0, submitted: 0, reported: 0 };

  // Click-rate trend by campaign, in chronological order
  const campaigns = await Campaign.find(
    buildTenantScopedQuery(
      { status: { $in: ["running", "completed"] } },
      organizationId,
      { status: { $in: ["running", "completed"] }, createdBy: { $in: adminIds } }
    )
  )
    .sort({ createdAt: 1 })
    .lean();
  const campaignIds = campaigns.map((c) => c._id);
  const perCampaign = await CampaignTarget.aggregate([
    { $match: { campaignId: { $in: campaignIds } } },
    {
      $group: {
        _id: "$campaignId",
        total: { $sum: 1 },
        clicked: { $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] } },
        reported: { $sum: { $cond: [{ $ne: ["$reportedAt", null] }, 1, 0] } },
      },
    },
  ]);
  const perCampaignMap = new Map(perCampaign.map((p) => [p._id.toString(), p]));
  const trend = campaigns.map((c) => {
    const s = perCampaignMap.get(c._id.toString()) ?? { total: 0, clicked: 0, reported: 0 };
    return {
      name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name,
      clickRate: s.total > 0 ? Math.round((s.clicked / s.total) * 100) : 0,
      reportRate: s.total > 0 ? Math.round((s.reported / s.total) * 100) : 0,
    };
  });

  // Department risk breakdown
  const deptByUser = new Map(employeeDocs.map((e) => [e._id.toString(), e.department]));
  const targetsByUser = await CampaignTarget.aggregate([
    { $match: { userId: { $in: employeeIds } } },
    {
      $group: {
        _id: "$userId",
        totalCampaigns: { $sum: 1 },
        clicked: { $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] } },
        submitted: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
        reported: { $sum: { $cond: [{ $ne: ["$reportedAt", null] }, 1, 0] } },
      },
    },
  ]);

  const deptAgg = new Map<string, { scores: number[] }>();
  for (const t of targetsByUser) {
    const dept = deptByUser.get(t._id.toString()) ?? "General";
    const score = computeRiskScore({
      totalCampaigns: t.totalCampaigns,
      clicked: t.clicked,
      submitted: t.submitted,
      reported: t.reported,
    });
    if (!deptAgg.has(dept)) deptAgg.set(dept, { scores: [] });
    deptAgg.get(dept)!.scores.push(score);
  }
  const departmentRisk = Array.from(deptAgg.entries()).map(([department, { scores }]) => ({
    department,
    avgRisk: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  // Leaderboard: safest employees (lowest risk, at least 1 campaign) and highest risk
  const nameByUser = new Map(employeeDocs.map((e) => [e._id.toString(), e]));
  const scored = targetsByUser
    .filter((t) => t.totalCampaigns > 0)
    .map((t) => ({
      user: nameByUser.get(t._id.toString()),
      score: computeRiskScore({
        totalCampaigns: t.totalCampaigns,
        clicked: t.clicked,
        submitted: t.submitted,
        reported: t.reported,
      }),
    }))
    .filter((s) => s.user);

  const riskiest = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);
  const safest = [...scored].sort((a, b) => a.score - b.score).slice(0, 5);

  const trainingCompletion = await TrainingProgress.countDocuments({ status: "completed", userId: { $in: employeeIds } });

  return NextResponse.json({
    totals: { totalCampaigns, totalEmployees, totalTemplates, totalModules },
    stats: {
      ...stats,
      clickRate: stats.total > 0 ? Math.round((stats.clicked / stats.total) * 100) : 0,
      reportRate: stats.total > 0 ? Math.round((stats.reported / stats.total) * 100) : 0,
      submitRate: stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0,
    },
    trend,
    departmentRisk,
    riskiest,
    safest,
    trainingCompletion,
  });
}

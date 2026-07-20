import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Campaign from "@/lib/models/Campaign";
import CampaignTarget from "@/lib/models/CampaignTarget";
import User from "@/lib/models/User";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin } from "@/lib/apiAuth";
import { computeRiskScore } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const [totalCampaigns, totalEmployees, totalTemplates, totalModules] = await Promise.all([
    Campaign.countDocuments(),
    User.countDocuments({ role: "employee" }),
    (await import("@/lib/models/Template")).default.countDocuments(),
    TrainingModule.countDocuments(),
  ]);

  const overallStats = await CampaignTarget.aggregate([
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
  const campaigns = await Campaign.find({ status: { $in: ["running", "completed"] } })
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
  const employees = await User.find({ role: "employee" }, "_id department").lean();
  const deptByUser = new Map(employees.map((e) => [e._id.toString(), e.department]));
  const targetsByUser = await CampaignTarget.aggregate([
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
  const employeeDocs = await User.find({ role: "employee" }, "name email department").lean();
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

  const trainingCompletion = await TrainingProgress.countDocuments({ status: "completed" });

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

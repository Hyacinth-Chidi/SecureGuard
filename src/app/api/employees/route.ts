import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import CampaignTarget from "@/lib/models/CampaignTarget";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin } from "@/lib/apiAuth";
import { computeRiskScore } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const employees = await User.find({ role: "employee" }).sort({ name: 1 }).lean();
  const employeeIds = employees.map((e) => e._id);

  const targetStats = await CampaignTarget.aggregate([
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
  const statsMap = new Map(targetStats.map((s) => [s._id.toString(), s]));

  const trainingStats = await TrainingProgress.aggregate([
    { $match: { userId: { $in: employeeIds }, status: "completed" } },
    { $group: { _id: "$userId", completed: { $sum: 1 } } },
  ]);
  const trainingMap = new Map(trainingStats.map((s) => [s._id.toString(), s.completed]));

  const enriched = employees.map((e) => {
    const stats = statsMap.get(e._id.toString()) ?? { totalCampaigns: 0, clicked: 0, submitted: 0, reported: 0 };
    return {
      ...e,
      riskScore: computeRiskScore(stats),
      campaignStats: stats,
      trainingCompleted: trainingMap.get(e._id.toString()) ?? 0,
    };
  });

  return NextResponse.json({ employees: enriched });
}

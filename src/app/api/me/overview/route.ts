import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SimulationResult from "@/lib/models/SimulationResult";
import TrainingProgress from "@/lib/models/TrainingProgress";
import TrainingModule from "@/lib/models/TrainingModule";
import User from "@/lib/models/User";
import Badge from "@/lib/models/Badge";
import { requireUser } from "@/lib/apiAuth";
import { computeRiskScore, computeResilienceScore } from "@/lib/utils";

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  await connectDB();
  const userId = session!.user.id;
  const adminIds = await User.find({ role: "admin" }, "_id");

  const targets = await SimulationResult.find({ userId, emailSentAt: { $ne: null } })
    .populate({ path: "simulationId", select: "name templateId", populate: { path: "templateId", select: "subject fromName" } })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const stats = {
    totalSimulations: await SimulationResult.countDocuments({ userId, emailSentAt: { $ne: null } }),
    clicked: await SimulationResult.countDocuments({ userId, clickedAt: { $ne: null } }),
    submitted: await SimulationResult.countDocuments({ userId, submittedAt: { $ne: null } }),
    reported: await SimulationResult.countDocuments({ userId, reportedAt: { $ne: null } }),
  };

  const totalModules = await TrainingModule.countDocuments(
    { published: true, createdBy: { $in: adminIds.map((admin) => admin._id) } }
  );
  const completedModules = await TrainingProgress.countDocuments({ userId, status: "completed" });
  const badges = await Badge.find({ userId }).sort({ createdAt: -1 }).lean();

  const resilienceScore = computeResilienceScore({
    completedCourses: completedModules,
    ...stats,
  });

  return NextResponse.json({
    riskScore: computeRiskScore(stats),
    resilienceScore,
    stats,
    recentEmails: targets,
    training: { total: totalModules, completed: completedModules },
    badges,
  });
}

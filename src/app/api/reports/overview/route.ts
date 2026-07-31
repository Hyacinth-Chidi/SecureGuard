import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Simulation from "@/lib/models/Simulation";
import SimulationResult from "@/lib/models/SimulationResult";
import User from "@/lib/models/User";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin } from "@/lib/apiAuth";
import Template from "@/lib/models/Template";
import { computeResilienceScore } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const [adminDocs, studentDocs] = await Promise.all([
    User.find({ role: "admin" }, "_id").lean(),
    User.find({ role: "student" }, "_id name email department").lean(),
  ]);
  const adminIds = adminDocs.map((admin) => admin._id);
  const studentIds = studentDocs.map((student) => student._id);

  const [totalSimulations, totalStudents, totalTemplates, totalModules] = await Promise.all([
    Simulation.countDocuments({ createdBy: { $in: adminIds } }),
    User.countDocuments({ role: "student" }),
    Template.countDocuments({ createdBy: { $in: adminIds } }),
    TrainingModule.countDocuments({ createdBy: { $in: adminIds } }),
  ]);

  const overallStats = await SimulationResult.aggregate([
    { $match: { userId: { $in: studentIds } } },
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

  // Click-rate trend by simulation, in chronological order
  const simulations = await Simulation.find(
    { status: { $in: ["running", "completed"] }, createdBy: { $in: adminIds } }
  )
    .sort({ createdAt: 1 })
    .lean();
  const simulationIds = simulations.map((s) => s._id);
  const perSimulation = await SimulationResult.aggregate([
    { $match: { simulationId: { $in: simulationIds } } },
    {
      $group: {
        _id: "$simulationId",
        total: { $sum: 1 },
        clicked: { $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] } },
        reported: { $sum: { $cond: [{ $ne: ["$reportedAt", null] }, 1, 0] } },
      },
    },
  ]);
  const perSimulationMap = new Map(perSimulation.map((p) => [p._id.toString(), p]));
  const trend = simulations.map((s) => {
    const p = perSimulationMap.get(s._id.toString()) ?? { total: 0, clicked: 0, reported: 0 };
    return {
      name: s.name.length > 18 ? s.name.slice(0, 18) + "…" : s.name,
      clickRate: p.total > 0 ? Math.round((p.clicked / p.total) * 100) : 0,
      reportRate: p.total > 0 ? Math.round((p.reported / p.total) * 100) : 0,
    };
  });

  // Department resilience breakdown
  const deptByUser = new Map(studentDocs.map((s) => [s._id.toString(), s.department]));
  const targetsByUser = await SimulationResult.aggregate([
    { $match: { userId: { $in: studentIds } } },
    {
      $group: {
        _id: "$userId",
        totalSimulations: { $sum: 1 },
        clicked: { $sum: { $cond: [{ $ne: ["$clickedAt", null] }, 1, 0] } },
        submitted: { $sum: { $cond: [{ $ne: ["$submittedAt", null] }, 1, 0] } },
        reported: { $sum: { $cond: [{ $ne: ["$reportedAt", null] }, 1, 0] } },
      },
    },
  ]);

  const completedCoursesByUser = await TrainingProgress.aggregate([
    { $match: { status: "completed", userId: { $in: studentIds } } },
    { $group: { _id: "$userId", completed: { $sum: 1 } } }
  ]);
  const completedMap = new Map(completedCoursesByUser.map((c) => [c._id.toString(), c.completed]));

  const deptAgg = new Map<string, { scores: number[] }>();
  for (const t of targetsByUser) {
    const dept = deptByUser.get(t._id.toString()) ?? "General";
    const score = computeResilienceScore({
      completedCourses: completedMap.get(t._id.toString()) || 0,
      totalSimulations: t.totalSimulations,
      clicked: t.clicked,
      submitted: t.submitted,
      reported: t.reported,
    });
    if (!deptAgg.has(dept)) deptAgg.set(dept, { scores: [] });
    deptAgg.get(dept)!.scores.push(score);
  }
  const departmentResilience = Array.from(deptAgg.entries()).map(([department, { scores }]) => ({
    department,
    avgResilience: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  // Leaderboard: safest students (highest resilience) and riskiest (lowest resilience)
  const nameByUser = new Map(studentDocs.map((s) => [s._id.toString(), s]));
  const scored = targetsByUser
    .filter((t) => t.totalSimulations > 0)
    .map((t) => ({
      user: nameByUser.get(t._id.toString()),
      score: computeResilienceScore({
        completedCourses: completedMap.get(t._id.toString()) || 0,
        totalSimulations: t.totalSimulations,
        clicked: t.clicked,
        submitted: t.submitted,
        reported: t.reported,
      }),
    }))
    .filter((s) => s.user);

  const riskiest = [...scored].sort((a, b) => a.score - b.score).slice(0, 5);
  const safest = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);

  const trainingCompletion = await TrainingProgress.countDocuments({ status: "completed", userId: { $in: studentIds } });

  return NextResponse.json({
    totals: { totalSimulations, totalStudents, totalTemplates, totalModules },
    stats: {
      ...stats,
      clickRate: stats.total > 0 ? Math.round((stats.clicked / stats.total) * 100) : 0,
      reportRate: stats.total > 0 ? Math.round((stats.reported / stats.total) * 100) : 0,
      submitRate: stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0,
    },
    trend,
    departmentResilience,
    riskiest,
    safest,
    trainingCompletion,
  });
}

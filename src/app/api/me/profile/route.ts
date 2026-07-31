import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import SimulationResult from "@/lib/models/SimulationResult";
import TrainingProgress from "@/lib/models/TrainingProgress";
import TrainingModule from "@/lib/models/TrainingModule";
import Badge from "@/lib/models/Badge";
import { requireUser } from "@/lib/apiAuth";
import { computeResilienceScore, resilienceLabel } from "@/lib/utils";

const BADGE_CATALOG = [
  { id: "first_course", name: "First Steps", description: "Completed your first security module", icon: "🌱" },
  { id: "perfect_score", name: "Sharp Mind", description: "Scored 100% on a module quiz", icon: "🎯" },
  { id: "first_report", name: "Hawk Eye", description: "Correctly reported a phishing simulation", icon: "🦅" },
  { id: "phish_survivor", name: "Unshakable", description: "Survived 3+ phishing tests with zero clicks", icon: "🛡️" },
  { id: "all_courses", name: "Master Defender", description: "Completed all awareness training courses", icon: "👑" },
];

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  await connectDB();
  const userId = session!.user.id;

  const user = await User.findById(userId, "name email department jobTitle createdAt").lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [earnedBadges, simResults, progressList] = await Promise.all([
    Badge.find({ userId }).lean(),
    SimulationResult.find({ userId, emailSentAt: { $ne: null } })
      .populate({ path: "simulationId", select: "name templateId", populate: { path: "templateId", select: "subject fromName" } })
      .sort({ createdAt: -1 })
      .lean(),
    TrainingProgress.find({ userId })
      .populate({ path: "moduleId", select: "title category" })
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const earnedSet = new Set(earnedBadges.map((b) => b.badgeType));
  const badgesWithStatus = BADGE_CATALOG.map((b) => {
    const earned = earnedBadges.find((eb) => eb.badgeType === b.id);
    return {
      ...b,
      earned: earnedSet.has(b.id),
      earnedAt: earned?.earnedAt ?? null,
    };
  });

  const stats = {
    totalSimulations: simResults.length,
    clicked: simResults.filter((s) => s.clickedAt).length,
    submitted: simResults.filter((s) => s.submittedAt).length,
    reported: simResults.filter((s) => s.reportedAt).length,
    completedCourses: progressList.filter((p) => p.status === "completed").length,
  };

  const resilienceScore = computeResilienceScore(stats);
  const rating = resilienceLabel(resilienceScore);

  // Build unified timeline
  const timeline: { id: string; type: "course" | "simulation"; title: string; subtitle: string; date: string; status: string }[] = [];

  for (const p of progressList) {
    if (p.status === "completed") {
      const module_ = p.moduleId as unknown as { title: string; category: string } | null;
      timeline.push({
        id: `p-${p._id.toString()}`,
        type: "course",
        title: `Completed: ${module_?.title ?? "Course"}`,
        subtitle: `Score: ${p.score ?? 100}% · ${module_?.category ?? "General"}`,
        date: (p.completedAt ?? p.updatedAt).toISOString(),
        status: "success",
      });
    }
  }

  for (const s of simResults) {
    const simObj = s.simulationId as unknown as { name: string; templateId?: { subject: string } } | null;
    const simName = simObj?.templateId?.subject ?? simObj?.name ?? "Phishing Simulation";

    if (s.reportedAt) {
      timeline.push({
        id: `s-rep-${s._id.toString()}`,
        type: "simulation",
        title: `Reported Phishing: ${simName}`,
        subtitle: "Correctly identified and reported suspicious email",
        date: s.reportedAt.toISOString(),
        status: "success",
      });
    } else if (s.submittedAt) {
      timeline.push({
        id: `s-sub-${s._id.toString()}`,
        type: "simulation",
        title: `Failed Simulation: ${simName}`,
        subtitle: "Entered credentials on phishing landing page",
        date: s.submittedAt.toISOString(),
        status: "danger",
      });
    } else if (s.clickedAt) {
      timeline.push({
        id: `s-clk-${s._id.toString()}`,
        type: "simulation",
        title: `Clicked Phishing Link: ${simName}`,
        subtitle: "Opened simulated phishing link",
        date: s.clickedAt.toISOString(),
        status: "warning",
      });
    }
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({
    user,
    resilienceScore,
    rating,
    badges: badgesWithStatus,
    stats,
    timeline: timeline.slice(0, 15),
  });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/apiAuth";
import User from "@/lib/models/User";
import SimulationResult from "@/lib/models/SimulationResult";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { computeResilienceScore } from "@/lib/utils";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const students = await User.find({ role: "student" }).select("name email department createdAt").lean();
    const studentIds = students.map((s) => s._id);

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
      { $group: { _id: "$userId", completed: { $sum: 1 } } },
    ]);
    const completedMap = new Map(completedCoursesByUser.map((c) => [c._id.toString(), c.completed]));
    const targetMap = new Map(targetsByUser.map((t) => [t._id.toString(), t]));

    const enrichedStudents = students.map((s) => {
      const idStr = s._id.toString();
      const t = targetMap.get(idStr) || { totalSimulations: 0, clicked: 0, submitted: 0, reported: 0 };
      const completedCourses = completedMap.get(idStr) || 0;

      const score = computeResilienceScore({
        completedCourses,
        totalSimulations: t.totalSimulations,
        clicked: t.clicked,
        submitted: t.submitted,
        reported: t.reported,
      });

      return {
        _id: idStr,
        name: s.name,
        email: s.email,
        department: s.department,
        joinedAt: s.createdAt,
        completedCourses,
        resilienceScore: score,
        totalSimulations: t.totalSimulations,
      };
    });

    return NextResponse.json({ students: enrichedStudents });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch students." }, { status: 500 });
  }
}

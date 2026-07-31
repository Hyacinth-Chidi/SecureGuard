import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import User from "@/lib/models/User";
import { requireAdmin, requireUser } from "@/lib/apiAuth";

const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().min(0),
});

const moduleSchema = z.object({
  title: z.string().min(2),
  summary: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  estimatedMinutes: z.number().int().min(1),
  quiz: z.array(quizQuestionSchema).default([]),
  published: z.boolean().default(true),
});

export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;

  await connectDB();
  const adminIds = await User.find({ role: "admin" }, "_id");

  if (session!.user.role === "admin") {
    const modules = await TrainingModule.find({ createdBy: { $in: adminIds.map((admin) => admin._id) } })
      .sort({ createdAt: -1 })
      .lean();
    const totalStudents = await User.countDocuments({
      role: "student",
      active: true,
    });
    const moduleIds = modules.map((module_) => module_._id);

    const progressAgg = await TrainingProgress.aggregate([
      {
        $match: { status: "completed", moduleId: { $in: moduleIds } },
      },
      { $group: { _id: "$moduleId", completions: { $sum: 1 }, avgScore: { $avg: "$score" } } },
    ]);
    const progressMap = new Map(progressAgg.map((p) => [p._id.toString(), p]));

    const enriched = modules.map((m) => ({
      ...m,
      completions: progressMap.get(m._id.toString())?.completions ?? 0,
      avgScore: Math.round(progressMap.get(m._id.toString())?.avgScore ?? 0),
      totalEmployees: totalStudents,
    }));

    return NextResponse.json({ modules: enriched });
  }

  const modules = await TrainingModule.find({
    published: true, createdBy: { $in: adminIds.map((admin) => admin._id) }
  })
    .sort({ createdAt: -1 })
    .lean();
  const progress = await TrainingProgress.find({ userId: session!.user.id }).lean();
  const progressMap = new Map(progress.map((p) => [p.moduleId.toString(), p]));

  const enriched = modules.map((m) => ({
    ...m,
    quiz: undefined,
    progress: progressMap.get(m._id.toString()) ?? { status: "not_started" },
  }));

  return NextResponse.json({ modules: enriched });
}

export async function POST(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = moduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const module_ = await TrainingModule.create({
    ...parsed.data,
    createdBy: session!.user.id,
  });
  return NextResponse.json({ module: module_ }, { status: 201 });
}

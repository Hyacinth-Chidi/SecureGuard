import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  await connectDB();

  const module_ = await TrainingModule.findById(id).lean();
  if (!module_) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session!.user.role === "admin") {
    return NextResponse.json({ module: module_ });
  }

  let progress = await TrainingProgress.findOne({ userId: session!.user.id, moduleId: id });
  if (!progress) {
    progress = await TrainingProgress.create({ userId: session!.user.id, moduleId: id, status: "in_progress" });
  } else if (progress.status === "not_started") {
    progress.status = "in_progress";
    await progress.save();
  }

  return NextResponse.json({ module: module_, progress });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = moduleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const module_ = await TrainingModule.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!module_) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ module: module_ });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  await TrainingModule.findByIdAndDelete(id);
  await TrainingProgress.deleteMany({ moduleId: id });
  return NextResponse.json({ success: true });
}

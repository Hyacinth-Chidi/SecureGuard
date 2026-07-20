import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireUser } from "@/lib/apiAuth";

const submitSchema = z.object({
  answers: z.array(z.number().int().min(0)),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  await connectDB();
  const module_ = await TrainingModule.findById(id);
  if (!module_) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { answers } = parsed.data;
  let correct = 0;
  module_.quiz.forEach((q: { correctIndex: number }, i: number) => {
    if (answers[i] === q.correctIndex) correct++;
  });
  const score = module_.quiz.length > 0 ? Math.round((correct / module_.quiz.length) * 100) : 100;

  const progress = await TrainingProgress.findOneAndUpdate(
    { userId: session!.user.id, moduleId: id },
    {
      status: "completed",
      score,
      completedAt: new Date(),
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ progress, score, correct, total: module_.quiz.length });
}

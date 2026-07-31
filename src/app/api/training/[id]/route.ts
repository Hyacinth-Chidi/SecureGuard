import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import TrainingModule from "@/lib/models/TrainingModule";
import TrainingProgress from "@/lib/models/TrainingProgress";
import { requireAdmin, requireUser } from "@/lib/apiAuth";
import User from "@/lib/models/User";
import { buildTenantScopedQuery } from "@/lib/organizationScope";

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
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");

  const module_ = await TrainingModule.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  ).lean();
  if (!module_) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session!.user.role === "org_admin") {
    const adminScopedModule = await TrainingModule.findOne(
      buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
    ).lean();
    if (!adminScopedModule) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ module: adminScopedModule });
  }

  if (session!.user.role !== "employee") {
    return NextResponse.json({ module: module_ });
  }

  if (!module_.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let progress = await TrainingProgress.findOne({ userId: session!.user.id, moduleId: id });
  if (!progress) {
    progress = await TrainingProgress.create({
      organizationId,
      userId: session!.user.id,
      moduleId: id,
      status: "in_progress",
    });
  } else if (progress.status === "not_started") {
    if (!progress.organizationId && organizationId) {
      progress.organizationId = organizationId;
    }
    progress.status = "in_progress";
    await progress.save();
  }

  return NextResponse.json({ module: module_, progress });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = moduleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  
  const existing = await TrainingModule.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.isSystem) {
    return NextResponse.json({ error: "System training modules cannot be modified" }, { status: 403 });
  }

  const module_ = await TrainingModule.findByIdAndUpdate(id, parsed.data, { new: true });
  return NextResponse.json({ module: module_ });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  
  const existing = await TrainingModule.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.isSystem) {
    return NextResponse.json({ error: "System training modules cannot be deleted" }, { status: 403 });
  }

  await TrainingModule.findByIdAndDelete(id);
  await TrainingProgress.deleteMany({ moduleId: id });
  return NextResponse.json({ success: true });
}

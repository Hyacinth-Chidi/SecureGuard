import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Template from "@/lib/models/Template";
import { requireAdmin } from "@/lib/apiAuth";

const templateSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  subject: z.string().min(1),
  htmlBody: z.string().min(1),
  landingHeadline: z.string().min(1),
  landingBody: z.string().min(1),
  redFlags: z.array(z.string()).default([]),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const template = await Template.findById(id).lean();
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = templateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const template = await Template.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  await Template.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

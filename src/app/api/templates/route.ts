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

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;
  void session;

  await connectDB();
  const templates = await Template.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const template = await Template.create({ ...parsed.data, createdBy: session!.user.id });
  return NextResponse.json({ template }, { status: 201 });
}

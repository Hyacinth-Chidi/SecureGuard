import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import Template from "@/lib/models/Template";
import Campaign from "@/lib/models/Campaign";
import { requireAdmin } from "@/lib/apiAuth";
import User from "@/lib/models/User";
import { buildTenantScopedQuery } from "@/lib/organizationScope";

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
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  const template = await Template.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  ).lean();
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = templateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");
  
  const existing = await Template.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.isSystem) {
    return NextResponse.json({ error: "System templates cannot be modified" }, { status: 403 });
  }

  const template = await Template.findByIdAndUpdate(id, parsed.data, { new: true });
  return NextResponse.json({ template });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await connectDB();
  const organizationId = session!.user.organizationId;
  const adminIds = await User.find({ organizationId, role: "org_admin" }, "_id");

  const existing = await Template.findOne(
    buildTenantScopedQuery({ _id: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) } })
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.isSystem) {
    return NextResponse.json({ error: "System templates cannot be deleted" }, { status: 403 });
  }

  const inUse = await Campaign.exists(
    buildTenantScopedQuery({ templateId: id }, organizationId, { createdBy: { $in: adminIds.map((admin) => admin._id) }, templateId: id })
  );
  if (inUse) {
    return NextResponse.json(
      { error: "This template is used by an existing campaign and cannot be deleted." },
      { status: 409 }
    );
  }
  await Template.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Organization from "@/lib/models/Organization";
import OrganizationInvite from "@/lib/models/OrganizationInvite";
import User from "@/lib/models/User";
import { hashInviteToken } from "@/lib/invites";

const joinSchema = z.object({
  orgSlug: z.string().trim().min(2).max(50),
  token: z.string().min(16),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const tokenHash = hashInviteToken(parsed.data.token);
  const invite = await OrganizationInvite.findOne({ tokenHash });
  if (!invite || invite.acceptedAt || invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite is invalid or expired." }, { status: 400 });
  }

  const organization = await Organization.findById(invite.organizationId);
  if (!organization || !organization.active || organization.slug !== parsed.data.orgSlug.toLowerCase().trim()) {
    return NextResponse.json({ error: "This invite is invalid for this workspace." }, { status: 400 });
  }

  const existingUser = await User.findOne({ email: invite.email }).lean();
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({
    name: parsed.data.name.trim(),
    email: invite.email,
    passwordHash,
    role: "employee",
    organizationId: organization._id,
    department: invite.department,
    jobTitle: invite.jobTitle,
    active: true,
  });

  invite.acceptedAt = new Date();
  invite.acceptedBy = user._id;
  await invite.save();

  return NextResponse.json({
    success: true,
    email: user.email,
    organizationSlug: organization.slug,
  });
}

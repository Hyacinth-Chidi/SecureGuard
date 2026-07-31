import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/apiAuth";
import Organization from "@/lib/models/Organization";
import OrganizationInvite from "@/lib/models/OrganizationInvite";
import User from "@/lib/models/User";
import { hashInviteToken, isEmailAllowedForOrganization } from "@/lib/invites";

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(80).optional().or(z.literal("")),
  department: z.string().trim().min(1).max(60).default("General"),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await connectDB();

  const organizationId = session!.user.organizationId;
  const organization = await Organization.findById(organizationId).lean();
  if (!organization || !organization.active) {
    return NextResponse.json({ error: "Organization is not available." }, { status: 404 });
  }

  if (organization.onboardingPolicy === "disabled") {
    return NextResponse.json({ error: "Employee onboarding is disabled for this organization." }, { status: 403 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const allowedDomains = organization.allowedEmailDomains ?? [];
  if (!isEmailAllowedForOrganization(email, allowedDomains)) {
    return NextResponse.json({ error: "Invite email must match an allowed organization domain." }, { status: 400 });
  }

  const existingUser = await User.findOne({ email }).lean();
  if (existingUser) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await OrganizationInvite.deleteMany({
    organizationId,
    email,
    acceptedAt: { $exists: false },
  });

  const invite = await OrganizationInvite.create({
    organizationId,
    email,
    name: parsed.data.name?.trim() || undefined,
    department: parsed.data.department.trim(),
    jobTitle: parsed.data.jobTitle?.trim() || undefined,
    tokenHash,
    expiresAt,
    createdBy: session!.user.id,
  });

  return NextResponse.json(
    {
      invite: {
        id: invite._id.toString(),
        email: invite.email,
        expiresAt: invite.expiresAt,
      },
      invitePath: `/${organization.slug}/join?token=${token}`,
    },
    { status: 201 }
  );
}

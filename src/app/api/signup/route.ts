import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Organization from "@/lib/models/Organization";
import User from "@/lib/models/User";
import { slugifyOrganizationName } from "@/lib/tenant";

const signupSchema = z.object({
  companyName: z.string().min(2).max(120),
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/).optional().or(z.literal("")),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
});

function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase().trim() ?? "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const companyName = parsed.data.companyName.trim();
    const requestedSlug = parsed.data.slug?.trim().toLowerCase() ?? "";
    const slug = requestedSlug || slugifyOrganizationName(companyName);
    if (!slug) {
      return NextResponse.json({ error: "Enter a company name that can generate a valid workspace slug." }, { status: 400 });
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.toLowerCase().trim();
    const password = parsed.data.password;
    const industry = parsed.data.industry?.trim() || undefined;
    const emailDomain = getEmailDomain(email);

    await connectDB();

    const [existingOrganization, existingUser] = await Promise.all([
      Organization.findOne({ slug }).lean(),
      User.findOne({ email }).lean(),
    ]);

    if (existingOrganization) {
      return NextResponse.json({ error: "That workspace slug is already in use." }, { status: 409 });
    }

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const organization = await Organization.create({
      name: companyName,
      slug,
      primaryDomain: emailDomain || undefined,
      industry,
      allowedEmailDomains: emailDomain ? [emailDomain] : [],
      onboardingPolicy: "invite_only",
      active: true,
    });

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      passwordHash,
      role: "org_admin",
      organizationId: organization._id,
      department: "Administration",
      active: true,
    });

    return NextResponse.json({ success: true, organizationSlug: slug });
  } catch (error) {
    console.error(error);

    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return NextResponse.json({ error: "That workspace or account already exists." }, { status: 409 });
    }

    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

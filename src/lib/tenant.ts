import mongoose from "mongoose";
import Organization from "@/lib/models/Organization";

const DEFAULT_ORGANIZATION_NAME = process.env.DEFAULT_ORGANIZATION_NAME?.trim() || "SecureGuard Legacy";
const DEFAULT_ORGANIZATION_SLUG = process.env.DEFAULT_ORGANIZATION_SLUG?.trim().toLowerCase() || "secureguard-legacy";
const DEFAULT_ORGANIZATION_DOMAIN = process.env.DEFAULT_ORGANIZATION_DOMAIN?.trim().toLowerCase();
const DEFAULT_ORGANIZATION_INDUSTRY = process.env.DEFAULT_ORGANIZATION_INDUSTRY?.trim() || "General";

export function slugifyOrganizationName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function getOrganizationBySlug(slug: string) {
  return Organization.findOne({ slug: slug.toLowerCase().trim(), active: true });
}

export async function ensureLegacyOrganization() {
  return Organization.findOneAndUpdate(
    { slug: DEFAULT_ORGANIZATION_SLUG },
    {
      $setOnInsert: {
        name: DEFAULT_ORGANIZATION_NAME,
        slug: DEFAULT_ORGANIZATION_SLUG,
        primaryDomain: DEFAULT_ORGANIZATION_DOMAIN,
        industry: DEFAULT_ORGANIZATION_INDUSTRY,
        active: true,
      },
    },
    { new: true, upsert: true }
  );
}

export async function ensureUserOrganization<T extends { role: string; organizationId?: mongoose.Types.ObjectId | null }>(
  user: T & { save?: () => Promise<unknown> }
) {
  if (user.role === "platform_admin") {
    return null;
  }

  if (user.organizationId) {
    return Organization.findById(user.organizationId);
  }

  const organization = await ensureLegacyOrganization();
  user.organizationId = organization._id;
  if (typeof user.save === "function") {
    await user.save();
  }
  return organization;
}

export function getOrganizationHomePath(role?: string, organizationSlug?: string | null) {
  if (!organizationSlug) {
    return "/dashboard";
  }

  if (role === "org_admin") {
    return `/${organizationSlug}/admin/dashboard`;
  }

  return `/${organizationSlug}/employee/dashboard`;
}

export function getPostLoginRedirect(role?: string, organizationSlug?: string | null) {
  if (role === "platform_admin") {
    return "/platform/admin/dashboard";
  }

  return getOrganizationHomePath(role, organizationSlug);
}

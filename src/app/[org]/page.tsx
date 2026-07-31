import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getOrganizationBySlug, getOrganizationHomePath } from "@/lib/tenant";
import { notFound, redirect } from "next/navigation";

export default async function OrganizationEntryPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  await connectDB();

  const organization = await getOrganizationBySlug(org);
  if (!organization) notFound();

  const session = await auth();
  if (!session?.user) {
    redirect(`/${organization.slug}/login`);
  }

  if (session.user.role === "platform_admin") {
    redirect("/platform/admin/dashboard");
  }

  if (session.user.organizationSlug !== organization.slug) {
    redirect(getOrganizationHomePath(session.user.role, session.user.organizationSlug));
  }

  redirect(getOrganizationHomePath(session.user.role, organization.slug));
}

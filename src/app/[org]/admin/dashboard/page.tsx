import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getOrganizationBySlug, getOrganizationHomePath } from "@/lib/tenant";

export default async function OrganizationAdminDashboardPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  await connectDB();

  const organization = await getOrganizationBySlug(org);
  if (!organization) notFound();

  const session = await auth();
  if (!session?.user) {
    redirect(`/${organization.slug}/login?callbackUrl=/${organization.slug}/admin/dashboard`);
  }

  if (session.user.role === "platform_admin") {
    redirect("/platform/admin/dashboard");
  }

  if (session.user.role !== "org_admin" || session.user.organizationSlug !== organization.slug) {
    redirect(getOrganizationHomePath(session.user.role, session.user.organizationSlug));
  }

  redirect("/dashboard/admin");
}

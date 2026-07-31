import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOrganizationHomePath } from "@/lib/tenant";

export default async function PlatformAdminDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/platform/admin/dashboard");
  }

  if (session.user.role !== "platform_admin") {
    redirect(getOrganizationHomePath(session.user.role, session.user.organizationSlug));
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="mx-auto max-w-3xl rounded-xl border border-line bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-semibold text-slate-dark">Platform admin</h1>
        <p className="mt-3 text-sm text-slate">
          Phase 1 sets up the platform admin route shell. Platform-wide dashboards and organization management screens
          are planned for later phases.
        </p>
      </div>
    </div>
  );
}

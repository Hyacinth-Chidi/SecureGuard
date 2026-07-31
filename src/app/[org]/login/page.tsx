import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { LoginForm } from "@/app/login/LoginForm";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { getOrganizationBySlug, getOrganizationHomePath } from "@/lib/tenant";

export default async function OrganizationLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { org } = await params;
  const { callbackUrl } = await searchParams;

  await connectDB();
  const organization = await getOrganizationBySlug(org);
  if (!organization) notFound();

  const session = await auth();
  if (session?.user) {
    if (session.user.role === "platform_admin") {
      redirect("/platform/admin/dashboard");
    }
    redirect(getOrganizationHomePath(session.user.role, session.user.organizationSlug));
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={28} height={28} className="rounded" />
          <span className="font-display font-semibold text-xl text-navy">{organization.name}</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-slate-dark text-center">Sign in to your workspace</h2>
        <p className="text-sm text-slate mt-1.5 mb-7 text-center">
          Use your organization account to access the SecureGuard awareness portal.
        </p>

        <LoginForm callbackUrl={callbackUrl ?? `/${organization.slug}`} orgSlug={organization.slug} />
      </div>
    </div>
  );
}

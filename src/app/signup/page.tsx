import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPostLoginRedirect } from "@/lib/tenant";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect(getPostLoginRedirect(session.user.role, session.user.organizationSlug));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-4xl glass-panel p-8 sm:p-12 rounded-3xl shadow-2xl relative z-10 border-border/50">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={36} height={36} className="rounded-lg shadow-md shadow-primary-glow/20" />
          <span className="font-display text-2xl font-bold text-white tracking-tight">SecureGuard</span>
        </div>

        <h2 className="text-center font-display text-3xl font-bold text-white mb-2">Create your workspace</h2>
        <p className="mb-10 text-center text-base text-text-muted leading-relaxed max-w-2xl mx-auto">
          Set up your organization, create the first admin account, and start from a private SecureGuard workspace.
        </p>

        <SignupForm />

        <p className="mt-8 text-center text-sm font-medium text-text-muted">
          Already have a workspace?{" "}
          <Link href="/login" className="text-primary hover:text-primary-glow transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

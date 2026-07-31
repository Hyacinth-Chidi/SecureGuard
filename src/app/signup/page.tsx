import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    const redirectPath = session.user.role === "admin" ? "/dashboard/admin" : "/dashboard/student";
    redirect(redirectPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-sm glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl relative z-10 border-border/50">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={36} height={36} className="rounded-lg shadow-md shadow-primary-glow/20" />
          <span className="font-display text-2xl font-bold text-white tracking-tight">SecureGuard</span>
        </div>

        <h2 className="text-center font-display text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="mb-10 text-center text-sm text-text-muted leading-relaxed">
          Set up your student account to access the awareness portal.
        </p>

        <SignupForm />

        <p className="mt-8 text-center text-sm font-medium text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-glow transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

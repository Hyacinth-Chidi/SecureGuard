import Link from "next/link";
import Image from "next/image";
import { Fish } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPostLoginRedirect } from "@/lib/tenant";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) {
    redirect(getPostLoginRedirect(session.user.role, session.user.organizationSlug));
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-body text-text-main">
      <div className="hidden lg:flex flex-col justify-between bg-[#050810] text-white p-12 relative overflow-hidden border-r border-border">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Subtle Glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-glow/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative flex items-center gap-3">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={36} height={36} className="rounded-lg shadow-md shadow-primary-glow/20" />
          <span className="font-display font-bold text-2xl tracking-tight">SecureGuard</span>
        </div>

        <div className="relative max-w-md z-10">
          <div className="inline-flex items-center gap-2 text-primary-glow text-xs font-bold uppercase tracking-widest mb-6 bg-primary-glow/10 border border-primary-glow/20 px-4 py-1.5 rounded-full shadow-sm">
            <Fish size={14} />
            Awareness &amp; phishing simulation
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-tight tracking-tight">
            Train your people to recognize the hook before they bite.
          </h1>
          <p className="text-text-muted mt-6 text-lg leading-relaxed font-light">
            Launch realistic phishing simulations, deliver bite-sized security training, and track
            organizational risk from one secure portal.
          </p>
        </div>

        <p className="relative text-sm font-medium text-text-muted/50 z-10">© {new Date().getFullYear()} SecureGuard. Internal use only.</p>
      </div>

      <div className="flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle Background Glow for right side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-sm glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 border-border/50">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded-lg shadow-md shadow-primary-glow/20" />
            <span className="font-display font-bold text-2xl text-white tracking-tight">SecureGuard</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">Sign in to your awareness portal.</p>

          <LoginForm callbackUrl={callbackUrl ?? "/dashboard"} />

          <p className="text-sm font-medium text-text-muted mt-8 text-center">
            Creating a company workspace?{" "}
            <Link href="/signup" className="text-primary hover:text-primary-glow transition-colors hover:underline">
              Start here
            </Link>
          </p>

          <p className="text-sm font-medium text-text-muted mt-4 text-center">
            New employee account?{" "}
            <Link href="/register" className="text-primary hover:text-primary-glow transition-colors hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

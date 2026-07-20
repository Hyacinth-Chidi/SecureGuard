import Link from "next/link";
import Image from "next/image";
import { Fish } from "lucide-react";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={32} height={32} className="rounded" />
          <span className="font-display font-semibold text-xl">SecureGuard</span>
        </div>

        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-1.5 text-teal-bright text-xs font-medium uppercase tracking-wider mb-5 bg-teal-bright/10 px-3 py-1 rounded-full">
            <Fish size={13} />
            Awareness &amp; phishing simulation
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Train your people to recognize the hook before they bite.
          </h1>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">
            Launch realistic phishing simulations, deliver bite-sized security training, and track
            organizational risk from one portal.
          </p>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} SecureGuard. Internal use only.</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Image src="/assets/logo.png" alt="SecureGuard Logo" width={28} height={28} className="rounded" />
            <span className="font-display font-semibold text-xl text-navy">SecureGuard</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-slate-dark">Welcome back</h2>
          <p className="text-sm text-slate mt-1.5 mb-7">Sign in to your awareness portal.</p>

          <LoginForm callbackUrl={callbackUrl ?? "/dashboard"} />

          <p className="text-xs text-slate mt-6 text-center">
            New employee account?{" "}
            <Link href="/register" className="text-teal font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

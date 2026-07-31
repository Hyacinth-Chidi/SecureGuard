import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  const selfRegistrationEnabled = process.env.ENABLE_SELF_REGISTRATION === "true";

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={28} height={28} className="rounded" />
          <span className="font-display font-semibold text-xl text-navy">SecureGuard</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-slate-dark text-center">
          {selfRegistrationEnabled ? "Create your account" : "Registration is disabled"}
        </h2>
        <p className="text-sm text-slate mt-1.5 mb-7 text-center">
          {selfRegistrationEnabled
            ? "Set up your employee login for the awareness portal."
            : "Ask your organization admin to create or invite your account before signing in."}
        </p>

        {selfRegistrationEnabled ? (
          <RegisterForm />
        ) : (
          <div className="rounded-lg border border-line bg-white px-4 py-4 text-sm text-slate">
            Public self-registration is turned off for safety.
          </div>
        )}

        <p className="text-xs text-slate mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-teal font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

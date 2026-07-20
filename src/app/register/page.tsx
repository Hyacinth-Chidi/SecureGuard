import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Image src="/assets/logo.png" alt="SecureGuard Logo" width={28} height={28} className="rounded" />
          <span className="font-display font-semibold text-xl text-navy">SecureGuard</span>
        </div>

        <h2 className="font-display text-2xl font-semibold text-slate-dark text-center">Create your account</h2>
        <p className="text-sm text-slate mt-1.5 mb-7 text-center">
          Set up your employee login for the awareness portal.
        </p>

        <RegisterForm />

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

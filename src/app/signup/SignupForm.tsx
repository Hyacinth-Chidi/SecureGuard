"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState("");

  function getPasswordStrength(pwd: string) {
    if (!pwd) return { score: 0, label: "", color: "bg-border" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-danger" };
    if (score === 2 || score === 3) return { score: 65, label: "Good", color: "bg-warning" };
    return { score: 100, label: "Strong", color: "bg-accent" };
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setPending(false);
      return;
    }

    const result = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Account created, but sign-in failed. Try logging in.");
      router.push("/login");
      return;
    }

    router.push("/dashboard/student");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div>
        <label htmlFor="name" className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="Jamie Chen"
          className="mt-1.5 w-full rounded-xl bg-surface/60 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          className="mt-1.5 w-full rounded-xl bg-surface/60 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Password
          </label>
          {password && (
            <span className="text-xs font-medium text-text-muted">
              Strength: <span className="font-bold text-white">{strength.label}</span>
            </span>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-1.5 w-full rounded-xl bg-surface/60 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {password && (
          <div className="mt-2 h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        )}
      </div>

      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-medium text-danger shadow-sm">
          {error}
        </p>
      ) : null}

      <div className="pt-2">
        <Button type="submit" disabled={pending} className="w-full font-bold shadow-lg shadow-primary/20" size="lg">
          {pending ? "Creating account…" : "Get Started Now"}
        </Button>
      </div>
    </form>
  );
}

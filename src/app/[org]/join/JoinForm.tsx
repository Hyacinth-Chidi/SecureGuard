"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function JoinForm({
  orgSlug,
  token,
}: {
  orgSlug: string;
  token: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      orgSlug,
      token,
      name: formData.get("name"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/join", {
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
      email: data.email,
      password: payload.password,
      orgSlug: data.organizationSlug,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Account created, but sign-in failed. Try logging in from your workspace.");
      router.push(`/${data.organizationSlug}/login`);
      return;
    }

    router.push(`/${data.organizationSlug}/employee/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-slate-dark">
          Full name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="Jamie Chen"
          className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-slate-dark">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </div>

      {error ? <p className="rounded-lg border border-coral/20 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Joining workspace..." : "Join workspace"}
      </Button>
    </form>
  );
}

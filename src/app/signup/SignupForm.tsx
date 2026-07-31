"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);

  const suggestedSlug = useMemo(() => slugify(companyName), [companyName]);
  const slugValue = slugDirty ? slug : suggestedSlug;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyName: formData.get("companyName"),
      slug: formData.get("slug"),
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      industry: formData.get("industry"),
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
      orgSlug: data.organizationSlug,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Workspace created, but sign-in failed. Try logging in from your organization URL.");
      router.push(`/${data.organizationSlug}/login`);
      return;
    }

    router.push(`/${data.organizationSlug}/admin/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 mt-4">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Company Details Column */}
        <div className="space-y-5">
          <h3 className="text-xl font-display font-bold text-white border-b border-border/50 pb-3 mb-2">Company Details</h3>
          
          <div>
            <label htmlFor="companyName" className="text-sm font-semibold text-text-main">
              Company name
            </label>
            <input
              id="companyName"
              name="companyName"
              required
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Acme Security"
              className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="slug" className="text-sm font-semibold text-text-main">
              Workspace slug
            </label>
            <input
              id="slug"
              name="slug"
              value={slugValue}
              onChange={(event) => {
                setSlugDirty(true);
                setSlug(event.target.value.toLowerCase());
              }}
              placeholder="acme-security"
              className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <p className="mt-2 text-xs text-text-muted">Your admin portal will live at `/{slugValue || "your-company"}/admin/dashboard`.</p>
          </div>

          <div>
            <label htmlFor="industry" className="text-sm font-semibold text-text-main">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              placeholder="Technology"
              className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Admin Account Column */}
        <div className="space-y-5">
          <h3 className="text-xl font-display font-bold text-white border-b border-border/50 pb-3 mb-2">Admin Account</h3>
          
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-text-main">
              Admin name
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="Jamie Chen"
              className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-text-main">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-text-main">
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
              className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      {error ? <p className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger shadow-sm">{error}</p> : null}

      <div className="pt-6 border-t border-border/50 flex justify-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto md:min-w-[240px]" size="lg">
          {pending ? "Creating workspace..." : "Create workspace"}
        </Button>
      </div>
    </form>
  );
}

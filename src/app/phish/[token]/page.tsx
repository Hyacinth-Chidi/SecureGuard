"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

interface Context {
  alreadySubmitted: boolean;
  alreadyReported: boolean;
  campaignName: string;
  template: {
    fromName: string;
    subject: string;
    landingHeadline: string;
    landingBody: string;
    redFlags: string[];
  };
}

export default function PhishLandingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [ctx, setCtx] = useState<Context | null>(null);
  const [stage, setStage] = useState<"loading" | "form" | "revealed" | "error">("loading");
  const [reported, setReported] = useState(false);

  useEffect(() => {
    fetch(`/api/track/context/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Context) => {
        setCtx(data);
        setReported(data.alreadyReported);
        setStage(data.alreadySubmitted ? "revealed" : "form");
      })
      .catch(() => setStage("error"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Nothing typed into this form is ever transmitted or stored — only the
    // fact that a submission was attempted is recorded, for training metrics.
    await fetch(`/api/track/s/${token}`, { method: "POST" });
    setStage("revealed");
  }

  async function handleReport() {
    await fetch(`/api/track/r/${token}`, { method: "POST" });
    setReported(true);
  }

  if (stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-slate text-sm">Loading…</p>
      </div>
    );
  }

  if (stage === "error" || !ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-sm">
          <ShieldCheck className="mx-auto text-teal mb-4" size={40} />
          <h1 className="font-display text-xl font-semibold text-slate-dark">Link not recognized</h1>
          <p className="text-sm text-slate mt-2">
            This simulation link is invalid or has expired. If you have questions, contact your security team.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4" style={{ background: "#eef2f4" }}>
        <div className="w-full max-w-sm bg-white rounded-xl border border-line shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded bg-navy flex items-center justify-center text-white text-xs font-bold">
              {ctx.template.fromName.slice(0, 1)}
            </div>
            <span className="font-medium text-slate-dark text-sm">{ctx.template.fromName}</span>
          </div>
          <h1 className="font-display text-lg font-semibold text-slate-dark mb-1">Sign in to continue</h1>
          <p className="text-xs text-slate mb-6">Please confirm your credentials to proceed.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
            <button
              type="submit"
              className="w-full bg-navy text-white text-sm font-medium py-2.5 rounded-lg hover:bg-navy-light transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="bg-coral/10 border border-coral/25 rounded-2xl p-8 text-center">
          <ShieldAlert className="mx-auto text-coral mb-4" size={40} />
          <h1 className="font-display text-2xl font-semibold text-slate-dark">{ctx.template.landingHeadline}</h1>
          <p className="text-sm text-slate mt-3 leading-relaxed">{ctx.template.landingBody}</p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 mt-4">
          <h2 className="font-display text-sm font-semibold text-slate-dark uppercase tracking-wide mb-3">
            What gave it away
          </h2>
          <ul className="space-y-2">
            {ctx.template.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-dark">
                <CheckCircle2 className="text-teal shrink-0 mt-0.5" size={16} />
                {flag}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={handleReport}
            disabled={reported}
            className="flex-1 border border-line rounded-lg px-4 py-3 text-sm font-medium text-slate-dark hover:bg-mist transition-colors disabled:opacity-60"
          >
            {reported ? "Reported — thank you" : "Report this as phishing"}
          </button>
          <Link
            href="/dashboard/employee/training"
            className="flex-1 bg-navy text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-navy-light transition-colors flex items-center justify-center gap-1.5"
          >
            Review awareness training
            <ArrowRight size={15} />
          </Link>
        </div>

        <p className="text-xs text-slate text-center mt-6">
          This was a simulated phishing exercise run by your organization&apos;s security team as part of {ctx.campaignName}.
          No real data was collected.
        </p>
      </div>
    </div>
  );
}

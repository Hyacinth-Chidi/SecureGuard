"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, CheckCircle2, ArrowRight, Users2 } from "lucide-react";

interface Context {
  alreadySubmitted: boolean;
  alreadyReported: boolean;
  campaignName: string;
  template: {
    fromName: string;
    subject: string;
    landingType: "generic" | "microsoft" | "portal" | "hr" | "invoice" | "social";
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
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (stage === "error" || !ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-sm">
          <ShieldCheck className="mx-auto text-primary mb-4" size={40} />
          <h1 className="font-display text-xl font-semibold text-white">Link not recognized</h1>
          <p className="text-sm text-text-muted mt-2">
            This simulation link is invalid or has expired. If you have questions, contact your security team.
          </p>
        </div>
      </div>
    );
  }

  if (stage === "form") {
    const landingType = ctx.template.landingType;

    if (landingType === "microsoft") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f2f1] px-4 font-['Segoe_UI',_sans-serif]">
          <div className="w-full max-w-[440px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] p-11">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-6 mb-6" />
            <h1 className="text-2xl font-semibold text-[#1b1b1b] mb-4">Sign in</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email, phone, or Skype"
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                className="w-full border-b border-[#605e5c] px-1 py-1.5 text-[15px] outline-none focus:border-b-2 focus:border-[#0067b8]"
              />
              <p className="text-[13px] text-[#0067b8] mt-2">No account? Create one!</p>
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="bg-[#0067b8] text-white px-8 py-1.5 font-semibold hover:bg-[#005da6]"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (landingType === "social") {
      return (
        <div className="min-h-screen flex flex-col bg-[#f0f2f5] font-[Helvetica,Arial,sans-serif]">
          <div className="w-full bg-white shadow-sm p-4 text-[#1877f2] font-bold text-2xl flex justify-center">
            facebook
          </div>
          <div className="flex-1 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-md p-6">
              <p className="text-center text-lg text-[#1c1e21] mb-6">Log in to Facebook</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Email address or phone number"
                  className="w-full border border-[#dddfe2] rounded-md px-4 py-3 text-[15px] outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-[#dddfe2] rounded-md px-4 py-3 text-[15px] outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#1877f2] text-white font-bold text-xl rounded-md py-2.5 hover:bg-[#166fe5]"
                >
                  Log In
                </button>
                <div className="text-center mt-4">
                  <a href="#" className="text-[#1877f2] text-sm hover:underline">Forgotten account?</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (landingType === "hr") {
      return (
        <div className="min-h-screen flex bg-gradient-to-br from-[#1b5a5e] to-[#0d3437] px-4 font-sans text-white">
          <div className="w-full max-w-sm m-auto bg-white rounded shadow-2xl p-8 text-gray-800">
            <div className="text-center mb-6">
              <div className="inline-block bg-[#1b5a5e] text-white p-3 rounded-full mb-3">
                <Users2 size={24} />
              </div>
              <h1 className="text-xl font-bold text-[#1b5a5e]">HR Benefits Portal</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in with your employee credentials</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Company Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#1b5a5e]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#1b5a5e]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#1b5a5e] text-white font-semibold py-2.5 rounded hover:bg-[#124144]"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (landingType === "invoice") {
      return (
        <div className="min-h-screen bg-gray-100 flex justify-center py-12 px-4 font-sans">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-t-lg shadow-sm p-6 border-b-4 border-[#2ca01c]">
              <h1 className="text-2xl font-bold text-gray-800">Invoice Payment</h1>
              <p className="text-sm text-gray-500 mt-1">Please authenticate to view secure document</p>
            </div>
            <div className="bg-white shadow-sm p-6 rounded-b-lg mt-[1px]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 px-4 py-3 rounded outline-none focus:border-[#2ca01c]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 px-4 py-3 rounded outline-none focus:border-[#2ca01c]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#2ca01c] text-white font-bold py-3 rounded hover:bg-[#258717]"
                >
                  View Invoice
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (landingType === "portal") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 font-mono text-green-500">
          <div className="w-full max-w-lg border border-green-500 p-6 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <h1 className="text-xl mb-4 font-bold border-b border-green-500 pb-2">SECUREGUARD_IT_AUTH_GATEWAY</h1>
            <p className="text-sm mb-6">&gt; ENTER CREDENTIALS TO PROCEED</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs mb-1">&gt; USERNAME_</label>
                <input
                  type="text"
                  className="w-full bg-black border border-green-700 text-green-500 px-3 py-2 outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">&gt; PASSWORD_</label>
                <input
                  type="password"
                  className="w-full bg-black border border-green-700 text-green-500 px-3 py-2 outline-none focus:border-green-400"
                />
              </div>
              <button
                type="submit"
                className="mt-6 border border-green-500 text-green-500 px-6 py-2 hover:bg-green-500 hover:text-black font-bold uppercase transition-colors"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Default "generic" variant
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

  // Revealed State (Premium Dark Theme)
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-xl mx-auto space-y-6">
        <div className="bg-coral/10 border border-coral/25 rounded-2xl p-8 text-center backdrop-blur-sm">
          <ShieldAlert className="mx-auto text-coral mb-4 drop-shadow-[0_0_8px_rgba(255,87,87,0.5)]" size={48} />
          <h1 className="font-display text-2xl font-semibold text-white tracking-tight">{ctx.template.landingHeadline}</h1>
          <p className="text-sm text-text-main mt-4 leading-relaxed">{ctx.template.landingBody}</p>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            What gave it away
          </h2>
          <ul className="space-y-3">
            {ctx.template.redFlags.map((flag, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-main bg-surface-hover/50 p-3 rounded-lg border border-border/50">
                <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={16} />
                <span className="leading-snug">{flag}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReport}
            disabled={reported}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-3.5 text-sm font-semibold text-white hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reported ? "Reported — thank you" : "Report this as phishing"}
          </button>
          <Link
            href="/dashboard/employee/training"
            className="flex-1 bg-primary text-white rounded-xl px-4 py-3.5 text-sm font-semibold hover:bg-primary-glow shadow-[0_0_15px_rgba(0,255,170,0.2)] transition-all flex items-center justify-center gap-2"
          >
            Review awareness training
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="text-xs text-text-muted text-center mt-8">
          This was a simulated phishing exercise run by your organization&apos;s security team as part of the <span className="text-white font-medium">{ctx.campaignName}</span> campaign.
          No real data was collected.
        </p>
      </div>
    </div>
  );
}

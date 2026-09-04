"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Info,
  X,
  Eye,
  Mail,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Primitives";

export interface SimulationTemplateData {
  _id?: string;
  name: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  htmlBody: string;
  landingType: "generic" | "microsoft" | "portal" | "hr" | "invoice" | "social";
  landingHeadline?: string;
  landingBody?: string;
  redFlags?: string[];
}

interface InteractiveSimulationLabProps {
  template: SimulationTemplateData;
  onComplete?: () => void;
}

export function InteractiveSimulationLab({ template, onComplete }: InteractiveSimulationLabProps) {
  const [userDecision, setUserDecision] = useState<"phishing" | "safe" | null>(null);
  const [showLandingPreview, setShowLandingPreview] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // Generate a realistic spoofed URL based on landing type
  const spoofedDomainMap: Record<string, string> = {
    microsoft: "https://login.microsoftonline.account-verify.co/auth",
    hr: "https://portal-benefits.employee-access-gate.net/login",
    invoice: "https://quickbooks-invoicing.secure-billing.org/pay",
    social: "https://auth.facebook-session-renew.com/checkpoint",
    portal: "https://gateway.internal-it-auth.org/login",
    generic: "https://secure-login.verification-portal.com/auth",
  };

  const simulatedTargetUrl = spoofedDomainMap[template.landingType] || spoofedDomainMap.generic;

  // Clean htmlBody: replace {{tracking_link}} and handle links safely
  const processedHtml = (template.htmlBody || "")
    .replace(/{{tracking_link}}/g, "#simulation-link")
    .replace(/{{first_name}}/g, "Alex");

  function handleAction(decision: "phishing" | "safe") {
    setUserDecision(decision);
  }

  return (
    <div className="mt-12 pt-8 border-t border-border/60 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-warning/10 text-warning">
              <Sparkles size={16} />
            </span>
            <Badge tone="medium">Hands-on Lab</Badge>
            <span className="text-xs text-text-muted">Interactive Simulation</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Threat Inspection Sandbox
          </h2>
          <p className="text-sm text-text-muted">
            Inspect this incoming email. Check the sender details, hover over buttons/links, and decide how you would respond.
          </p>
        </div>
      </div>

      {/* Simulated Email Client Frame */}
      <div className="rounded-2xl border border-border/80 bg-[#070b14] overflow-hidden shadow-2xl shadow-black/40">
        {/* Email Client Top Bar */}
        <div className="bg-surface/80 border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-accent/80" />
            <span className="text-xs text-text-muted ml-2 font-mono flex items-center gap-1.5">
              <Mail size={13} /> Inbox Preview — {template.name}
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted/70 bg-surface px-2 py-0.5 rounded border border-border/40">
            Simulated Mail Client
          </span>
        </div>

        {/* Email Headers */}
        <div className="p-5 border-b border-border/40 bg-surface/20 space-y-2 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-white">
              {template.subject}
            </h3>
            <span className="text-xs text-text-muted">Today at 10:42 AM</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-text-muted text-xs">
            <span className="font-semibold text-text-main">From:</span>
            <span className="text-white font-medium">{template.fromName}</span>
            <span className="text-text-muted/80 font-mono text-[11px] bg-surface px-2 py-0.5 rounded border border-border/50">
              &lt;{template.fromEmail}&gt;
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-warning bg-warning/10 border border-warning/30 px-2 py-0.5 rounded-full">
              <AlertTriangle size={11} /> External Sender
            </span>
          </div>
          <div className="text-xs text-text-muted flex items-center gap-2">
            <span className="font-semibold text-text-main">To:</span>
            <span>alex.student@company.internal</span>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-6 md:p-8 bg-surface/10 min-h-[160px] text-text-main text-sm leading-relaxed">
          <div
            className="prose prose-invert max-w-none prose-a:text-primary-glow prose-a:underline prose-a:cursor-pointer"
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === "A" || target.closest("a") || target.tagName === "BUTTON") {
                setHoveredLink(simulatedTargetUrl);
              }
            }}
            onMouseOut={() => setHoveredLink(null)}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === "A" || target.closest("a") || target.tagName === "BUTTON") {
                e.preventDefault();
                setShowLandingPreview(true);
              }
            }}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />
        </div>

        {/* Live Link URL Inspector Bar (simulates browser bottom-left URL hover tooltip) */}
        <div className="px-4 py-2 bg-surface/90 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-text-main">Link Inspector:</span>
            {hoveredLink ? (
              <span className="font-mono text-warning font-semibold truncate bg-warning/10 px-2 py-0.5 rounded border border-warning/30 flex items-center gap-1">
                <ExternalLink size={12} /> {hoveredLink}
              </span>
            ) : (
              <span className="text-text-muted/60 italic">Hover over any link in the email to inspect its true destination URL</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowLandingPreview(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-primary-glow hover:underline ml-4 shrink-0 cursor-pointer"
          >
            <Eye size={13} /> Preview Landing Page
          </button>
        </div>
      </div>

      {/* Decision Buttons (Active if no decision yet, or allow retrying) */}
      <div className="bg-surface/30 border border-border/60 rounded-2xl p-6">
        {!userDecision ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-display text-base font-bold text-white">What would you do with this email?</h4>
                <p className="text-xs text-text-muted">Test your instincts based on the lesson you just completed.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLandingPreview(true)}
                className="gap-1.5 self-start sm:self-auto text-xs"
              >
                <Eye size={14} /> See Fake Landing Page
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="danger"
                size="md"
                onClick={() => handleAction("phishing")}
                className="flex-1 gap-2 text-sm font-semibold"
              >
                <Flag size={16} />
                Report as Phishing
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => handleAction("safe")}
                className="flex-1 gap-2 text-sm font-semibold border-border hover:border-text-muted"
              >
                <ShieldCheck size={16} />
                Mark as Legitimate / Safe
              </Button>
            </div>
          </div>
        ) : (
          /* Instant Teachable Feedback Banner */
          <div className="space-y-6">
            {userDecision === "phishing" ? (
              <div className="p-5 rounded-xl bg-accent/10 border border-accent/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20 text-accent">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-white">
                      Outstanding Catch! You Spot the Phish! 🎯
                    </h4>
                    <p className="text-xs text-text-muted">
                      You correctly identified this simulation as a malicious phishing attempt. Reporting attacks promptly keeps your organization secure.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-danger/10 border border-danger/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-danger/20 text-danger">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-white">
                      Watch Out! This Was a Phishing Attack ⚠️
                    </h4>
                    <p className="text-xs text-text-muted">
                      Marking this email as safe would have exposed your credentials or system. Let's analyze what gave it away.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Red Flags Breakdown */}
            {template.redFlags && template.redFlags.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-display text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Info size={14} className="text-primary-glow" />
                  Key Red Flags in This Scenario
                </h5>
                <div className="grid gap-2.5">
                  {template.redFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-surface/50 border border-border/60 text-xs text-text-main"
                    >
                      <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons to Re-try or Continue */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/40">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserDecision(null)}
                  className="text-xs"
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLandingPreview(true)}
                  className="gap-1.5 text-xs text-primary-glow"
                >
                  <Eye size={13} /> View Attack Landing Page
                </Button>
              </div>

              {onComplete && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onComplete}
                  className="gap-1.5 text-xs font-semibold"
                >
                  Continue to Knowledge Quiz
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Landing Page Preview Modal */}
      {showLandingPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-surface border-b border-border px-5 py-3.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-danger" />
                <span className="font-display font-bold text-white text-sm">
                  Simulated Credential Harvester ({template.landingType.toUpperCase()})
                </span>
              </div>
              <button
                onClick={() => setShowLandingPreview(false)}
                className="text-text-muted hover:text-white p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-3 bg-danger/10 border border-danger/25 rounded-xl text-xs text-text-main flex items-start gap-2.5">
                <Info size={16} className="text-danger shrink-0 mt-0.5" />
                <span>
                  <strong>Educational Preview:</strong> If a victim clicks the link in this email, they land on this fake sign-in portal designed to steal their login credentials.
                </span>
              </div>

              {/* Mini Harvester Mockups */}
              <div className="rounded-xl border border-border p-6 bg-[#121624] flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-3">
                  <ShieldAlert size={26} />
                </div>
                <h3 className="font-display text-lg font-bold text-white">
                  {template.landingHeadline || "Account Verification Required"}
                </h3>
                <p className="text-xs text-text-muted mt-1 max-w-md">
                  {template.landingBody || "Please confirm your credentials to verify your identity and maintain account access."}
                </p>

                <div className="mt-6 w-full max-w-sm space-y-3 text-left">
                  <div>
                    <label className="text-xs text-text-muted">Username / Work Email</label>
                    <input
                      disabled
                      placeholder="alex.student@company.internal"
                      className="mt-1 w-full rounded-lg bg-surface/50 border border-border px-3 py-2 text-xs text-text-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted">Password</label>
                    <input
                      disabled
                      type="password"
                      placeholder="••••••••••••"
                      className="mt-1 w-full rounded-lg bg-surface/50 border border-border px-3 py-2 text-xs text-text-muted cursor-not-allowed"
                    />
                  </div>
                  <button
                    disabled
                    className="w-full mt-2 py-2 bg-primary/40 text-white/50 text-xs font-semibold rounded-lg cursor-not-allowed"
                  >
                    Authenticate (Harvester Demo)
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-border px-5 py-3 flex justify-end bg-surface">
              <Button size="sm" onClick={() => setShowLandingPreview(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

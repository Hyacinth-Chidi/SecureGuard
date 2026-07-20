import crypto from "crypto";

/** Generates a URL-safe unique token used to identify a campaign target in tracking links. */
export function generateTrackingToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date?: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(date?: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Computes a 0-100 "phish-prone" risk score for an employee based on their
 * simulated-campaign history. Higher = riskier. Weighs clicking/submitting
 * credentials heavily, rewards reporting suspicious emails.
 */
export function computeRiskScore(stats: {
  totalCampaigns: number;
  clicked: number;
  submitted: number;
  reported: number;
}): number {
  const { totalCampaigns, clicked, submitted, reported } = stats;
  if (totalCampaigns === 0) return 0;

  const clickRate = clicked / totalCampaigns;
  const submitRate = submitted / totalCampaigns;
  const reportRate = reported / totalCampaigns;

  let score = clickRate * 60 + submitRate * 40 - reportRate * 30;
  score = Math.max(0, Math.min(100, score));
  return Math.round(score);
}

export function riskLabel(score: number): { label: string; tone: "low" | "medium" | "high" } {
  if (score >= 60) return { label: "High risk", tone: "high" };
  if (score >= 30) return { label: "Medium risk", tone: "medium" };
  return { label: "Low risk", tone: "low" };
}

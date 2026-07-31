import crypto from "crypto";

/** Generates a URL-safe unique token used to identify a simulation target in tracking links. */
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
 * Computes a 0-100 awareness score for a student based on their
 * simulation history. Higher = riskier (more likely to fall for phishing).
 * Weighs clicking/submitting credentials heavily, rewards reporting.
 */
export function computeRiskScore(stats: {
  totalSimulations: number;
  clicked: number;
  submitted: number;
  reported: number;
}): number {
  const { totalSimulations, clicked, submitted, reported } = stats;
  if (totalSimulations === 0) return 0;

  const clickRate = clicked / totalSimulations;
  const submitRate = submitted / totalSimulations;
  const reportRate = reported / totalSimulations;

  let score = clickRate * 60 + submitRate * 40 - reportRate * 30;
  score = Math.max(0, Math.min(100, score));
  return Math.round(score);
}

export function riskLabel(score: number): { label: string; tone: "low" | "medium" | "high" } {
  if (score >= 60) return { label: "High risk", tone: "high" };
  if (score >= 30) return { label: "Medium risk", tone: "medium" };
  return { label: "Low risk", tone: "low" };
}

/**
 * Computes a 0-1000 resilience score for a student. Higher = better / safer.
 * Rewards training completion and reporting phishing, penalizes clicking and credential submission.
 */
export function computeResilienceScore(stats: {
  completedCourses: number;
  totalSimulations: number;
  clicked: number;
  submitted: number;
  reported: number;
}): number {
  const { completedCourses, clicked, submitted, reported } = stats;
  let score = 100; // Base starting points
  score += completedCourses * 200;
  score += reported * 100;
  score -= clicked * 150;
  score -= submitted * 250;

  return Math.max(0, Math.min(1000, Math.round(score)));
}

export function resilienceLabel(score: number): { label: string; tone: "low" | "medium" | "high" | "success" } {
  if (score >= 850) return { label: "Guardian", tone: "success" };
  if (score >= 600) return { label: "Defender", tone: "low" };
  if (score >= 300) return { label: "Aware", tone: "medium" };
  return { label: "Novice", tone: "high" };
}


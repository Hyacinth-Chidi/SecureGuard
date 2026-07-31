"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, Flag, Bell, ShieldCheck, AlertTriangle, Award, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDate, resilienceLabel } from "@/lib/utils";

interface NotificationItem {
  _id: string;
  type: "remediation" | "badge_earned" | "course_available";
  title: string;
  message: string;
  link?: string;
  read: boolean;
}

interface Overview {
  riskScore: number;
  resilienceScore: number;
  stats: { totalSimulations: number; clicked: number; submitted: number; reported: number };
  training: { total: number; completed: number };
  badges: { _id: string; badgeType: string }[];
  recentEmails: {
    _id: string;
    token: string;
    createdAt: string;
    clickedAt: string | null;
    reportedAt: string | null;
    simulationId: { name: string; templateId: { subject: string; fromName: string } | null } | null;
  }[];
}

export default function StudentOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reportingId, setReportingId] = useState<string | null>(null);

  function load() {
    fetch("/api/me/overview")
      .then((r) => r.json())
      .then(setData);

    fetch("/api/me/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []));
  }

  useEffect(load, []);

  async function markNotificationRead(id: string) {
    await fetch("/api/me/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  }

  async function handleReport(token: string) {
    setReportingId(token);
    await fetch(`/api/track/r/${token}`, { method: "POST" });
    setReportingId(null);
    load();
  }

  if (!data) return <LoadingBlock />;

  const resMeta = resilienceLabel(data.resilienceScore ?? 500);
  const unreadNotifs = notifications.filter((n) => !n.read);

  return (
    <div>
      <PageHeader title="My overview" description="Your personal phishing awareness snapshot." />

      <div className="p-4 md:p-8 space-y-6">
        {/* Notification Banners */}
        {unreadNotifs.length > 0 && (
          <div className="space-y-3">
            {unreadNotifs.map((n) => (
              <div
                key={n._id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 shadow-md ${
                  n.type === "remediation"
                    ? "bg-danger/10 border-danger/30 text-white"
                    : "bg-primary/10 border-primary/30 text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {n.type === "remediation" ? (
                    <AlertTriangle className="text-danger shrink-0" size={20} />
                  ) : (
                    <Award className="text-primary-glow shrink-0" size={20} />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{n.title}</p>
                    <p className="text-xs text-text-muted truncate">{n.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => markNotificationRead(n._id)}
                      className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-glow transition-colors"
                    >
                      Review Course
                    </Link>
                  )}
                  <button
                    onClick={() => markNotificationRead(n._id)}
                    className="text-xs text-text-muted hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Resilience Rating</span>
              <Badge tone={resMeta.tone}>{resMeta.label}</Badge>
            </div>
            <div className="relative flex items-center justify-center my-2">
              <div className="text-4xl font-extrabold font-display text-white tracking-tight">
                {data.resilienceScore ?? 500}
                <span className="text-xs text-text-muted font-normal"> / 1000</span>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Higher score = stronger defense against cyber threats
            </p>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-text-main mb-4">Your activity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-semibold text-text-main">{data.stats.totalSimulations}</p>
                <p className="text-xs text-text-muted mt-0.5">Simulations received</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-danger">{data.stats.clicked}</p>
                <p className="text-xs text-text-muted mt-0.5">Clicked</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-accent">{data.stats.reported}</p>
                <p className="text-xs text-text-muted mt-0.5">Reported</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-primary-glow">
                  {data.training.completed}/{data.training.total}
                </p>
                <p className="text-xs text-text-muted mt-0.5">Training done</p>
              </div>
            </div>
            <Link
              href="/dashboard/student/training"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-5 hover:underline"
            >
              <GraduationCap size={13} />
              Continue your training
              <ArrowUpRight size={13} />
            </Link>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-text-main">Recent simulated emails</h3>
            <p className="text-xs text-text-muted mt-0.5">
              If you spot something suspicious in your real inbox, report it the same way — through your email
              client&apos;s report button.
            </p>
          </div>
          {data.recentEmails.length === 0 ? (
            <p className="text-sm text-text-muted p-6">No simulated emails yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {data.recentEmails.map((e) => (
                <div key={e._id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-main truncate">
                      {e.simulationId?.templateId?.subject ?? e.simulationId?.name ?? "Simulated email"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      From {e.simulationId?.templateId?.fromName ?? "Unknown"} · {formatDate(e.createdAt)}
                    </p>
                  </div>
                  {e.reportedAt ? (
                    <Badge tone="success">Reported</Badge>
                  ) : (
                    <button
                      onClick={() => handleReport(e.token)}
                      disabled={reportingId === e.token}
                      className="inline-flex items-center gap-1.5 text-xs font-medium border border-border rounded-lg px-3 py-1.5 text-text-main hover:bg-surface-hover transition-colors shrink-0"
                    >
                      <Flag size={12} />
                      {reportingId === e.token ? "Reporting…" : "Report as phishing"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

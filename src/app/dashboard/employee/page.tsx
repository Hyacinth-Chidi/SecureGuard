"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, Flag } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDate } from "@/lib/utils";

interface Overview {
  riskScore: number;
  stats: { totalCampaigns: number; clicked: number; submitted: number; reported: number };
  training: { total: number; completed: number };
  recentEmails: {
    _id: string;
    token: string;
    createdAt: string;
    clickedAt: string | null;
    reportedAt: string | null;
    campaignId: { name: string; templateId: { subject: string; fromName: string } | null } | null;
  }[];
}

export default function EmployeeOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [reportingId, setReportingId] = useState<string | null>(null);

  function load() {
    fetch("/api/me/overview")
      .then((r) => r.json())
      .then(setData);
  }

  useEffect(load, []);

  async function handleReport(token: string) {
    setReportingId(token);
    await fetch(`/api/track/r/${token}`, { method: "POST" });
    setReportingId(null);
    load();
  }

  if (!data) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="My overview" description="Your personal phishing awareness snapshot." />

      <div className="p-8 space-y-6">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-6 flex flex-col items-center justify-center">
            <RiskGauge score={data.riskScore} />
            <p className="text-xs text-slate mt-2 text-center">Your phish-prone score</p>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-slate-dark mb-4">Your activity</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-semibold text-slate-dark">{data.stats.totalCampaigns}</p>
                <p className="text-xs text-slate mt-0.5">Simulations received</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-coral">{data.stats.clicked}</p>
                <p className="text-xs text-slate mt-0.5">Clicked</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-teal">{data.stats.reported}</p>
                <p className="text-xs text-slate mt-0.5">Reported</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-navy">
                  {data.training.completed}/{data.training.total}
                </p>
                <p className="text-xs text-slate mt-0.5">Training done</p>
              </div>
            </div>
            <Link
              href="/dashboard/employee/training"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal mt-5 hover:underline"
            >
              <GraduationCap size={13} />
              Continue your training
              <ArrowUpRight size={13} />
            </Link>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-slate-dark">Recent simulated emails</h3>
            <p className="text-xs text-slate mt-0.5">
              If you spot something suspicious in your real inbox, report it the same way — through your email
              client&apos;s report button.
            </p>
          </div>
          {data.recentEmails.length === 0 ? (
            <p className="text-sm text-slate p-6">No simulated emails yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {data.recentEmails.map((e) => (
                <div key={e._id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-dark truncate">
                      {e.campaignId?.templateId?.subject ?? e.campaignId?.name ?? "Simulated email"}
                    </p>
                    <p className="text-xs text-slate mt-0.5">
                      From {e.campaignId?.templateId?.fromName ?? "Unknown"} · {formatDate(e.createdAt)}
                    </p>
                  </div>
                  {e.reportedAt ? (
                    <Badge tone="success">Reported</Badge>
                  ) : (
                    <button
                      onClick={() => handleReport(e.token)}
                      disabled={reportingId === e.token}
                      className="inline-flex items-center gap-1.5 text-xs font-medium border border-line rounded-lg px-3 py-1.5 text-slate-dark hover:bg-mist transition-colors shrink-0"
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

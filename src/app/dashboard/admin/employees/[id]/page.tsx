"use client";

import { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock } from "@/components/dashboard/States";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { formatDate, initials } from "@/lib/utils";

interface EmployeeDetail {
  employee: { name: string; email: string; department: string; jobTitle?: string; createdAt: string };
  riskScore: number;
  stats: { totalCampaigns: number; clicked: number; submitted: number; reported: number };
  targets: {
    _id: string;
    campaignId: { name: string; status: string; createdAt: string } | null;
    openedAt: string | null;
    clickedAt: string | null;
    submittedAt: string | null;
    reportedAt: string | null;
  }[];
  trainingProgress: {
    _id: string;
    moduleId: { title: string; category: string } | null;
    status: string;
    score?: number;
    completedAt?: string;
  }[];
}

function targetOutcome(t: EmployeeDetail["targets"][number]) {
  if (t.reportedAt) return { label: "Reported", tone: "success" as const };
  if (t.submittedAt) return { label: "Submitted data", tone: "high" as const };
  if (t.clickedAt) return { label: "Clicked", tone: "medium" as const };
  if (t.openedAt) return { label: "Opened only", tone: "info" as const };
  return { label: "No interaction", tone: "neutral" as const };
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<EmployeeDetail | null>(null);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data) return <LoadingBlock />;

  const { employee, stats, targets, trainingProgress, riskScore } = data;

  return (
    <div>
      <PageHeader title={employee.name} description={`${employee.jobTitle ?? "Employee"} · ${employee.department}`} />

      <div className="p-8 space-y-6">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-6 flex flex-col items-center justify-center">
            <RiskGauge score={riskScore} />
            <p className="text-xs text-slate mt-2 text-center">
              Based on {stats.totalCampaigns} simulated campaign{stats.totalCampaigns === 1 ? "" : "s"}
            </p>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-navy/10 text-navy flex items-center justify-center text-sm font-semibold font-mono-data">
                {initials(employee.name)}
              </div>
              <div>
                <p className="font-medium text-slate-dark">{employee.email}</p>
                <p className="text-xs text-slate">Joined {formatDate(employee.createdAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="font-display text-xl font-semibold text-slate-dark">{stats.totalCampaigns}</p>
                <p className="text-xs text-slate mt-0.5">Campaigns</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-coral">{stats.clicked}</p>
                <p className="text-xs text-slate mt-0.5">Clicked</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-coral">{stats.submitted}</p>
                <p className="text-xs text-slate mt-0.5">Submitted</p>
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-teal">{stats.reported}</p>
                <p className="text-xs text-slate mt-0.5">Reported</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-slate-dark">Campaign history</h3>
          </div>
          {targets.length === 0 ? (
            <p className="text-sm text-slate p-6">No campaigns yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-mist/60 text-left text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Outcome</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {targets.map((t) => {
                  const outcome = targetOutcome(t);
                  return (
                    <tr key={t._id}>
                      <td className="px-5 py-3.5 font-medium text-slate-dark">{t.campaignId?.name ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={outcome.tone}>{outcome.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate">{formatDate(t.campaignId?.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-slate-dark">Training progress</h3>
          </div>
          {trainingProgress.length === 0 ? (
            <p className="text-sm text-slate p-6">No training started yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-mist/60 text-left text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="px-5 py-3 font-medium">Module</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {trainingProgress.map((p) => (
                  <tr key={p._id}>
                    <td className="px-5 py-3.5 font-medium text-slate-dark">{p.moduleId?.title ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={p.status === "completed" ? "success" : "info"}>{p.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-dark font-mono-data">{p.score != null ? `${p.score}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

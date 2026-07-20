"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Users, GraduationCap, Fish, ArrowUpRight, ShieldAlert, MessageSquareWarning } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard, Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock } from "@/components/dashboard/States";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface Overview {
  totals: { totalCampaigns: number; totalEmployees: number; totalTemplates: number; totalModules: number };
  stats: { total: number; clickRate: number; reportRate: number; submitRate: number };
  trend: { name: string; clickRate: number; reportRate: number }[];
  departmentRisk: { department: string; avgRisk: number }[];
  riskiest: { user: { name: string; department: string }; score: number }[];
  trainingCompletion: number;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/reports/overview")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Organization-wide phishing resilience and training progress."
        action={
          <Link
            href="/dashboard/admin/campaigns/new"
            className="inline-flex items-center gap-1.5 bg-navy text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-navy-light transition-colors"
          >
            <Send size={15} />
            New campaign
          </Link>
        }
      />

      {!data ? (
        <LoadingBlock />
      ) : (
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Employees enrolled" value={data.totals.totalEmployees} icon={<Users size={18} />} tone="navy" />
            <StatCard
              label="Click rate"
              value={`${data.stats.clickRate}%`}
              sublabel="Across all campaigns"
              icon={<Fish size={18} />}
              tone="coral"
            />
            <StatCard
              label="Report rate"
              value={`${data.stats.reportRate}%`}
              sublabel="Simulations reported"
              icon={<MessageSquareWarning size={18} />}
              tone="teal"
            />
            <StatCard
              label="Training completions"
              value={data.trainingCompletion}
              icon={<GraduationCap size={18} />}
              tone="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-slate-dark">Click vs. report rate by campaign</h3>
              </div>
              {data.trend.length === 0 ? (
                <p className="text-sm text-slate py-12 text-center">Run a campaign to see trend data here.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaf1f3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5e7787" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#5e7787" }} unit="%" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #dbe6ea", fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="clickRate" name="Clicked" stroke="#e8544a" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="reportRate" name="Reported" stroke="#0e8c82" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold text-slate-dark mb-4">Highest risk employees</h3>
              {data.riskiest.length === 0 ? (
                <p className="text-sm text-slate py-8 text-center">No campaign data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.riskiest.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-dark truncate">{r.user?.name}</p>
                        <p className="text-xs text-slate truncate">{r.user?.department}</p>
                      </div>
                      <Badge tone={r.score >= 60 ? "high" : r.score >= 30 ? "medium" : "low"}>{r.score}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/dashboard/admin/employees"
                className="inline-flex items-center gap-1 text-xs font-medium text-teal mt-4 hover:underline"
              >
                View all employees <ArrowUpRight size={13} />
              </Link>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-navy" />
              <h3 className="font-display font-semibold text-slate-dark">Average risk score by department</h3>
            </div>
            {data.departmentRisk.length === 0 ? (
              <p className="text-sm text-slate py-8 text-center">No campaign data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.departmentRisk}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaf1f3" />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#5e7787" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#5e7787" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #dbe6ea", fontSize: 12 }} />
                  <Bar dataKey="avgRisk" name="Avg. risk" fill="#0f3457" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

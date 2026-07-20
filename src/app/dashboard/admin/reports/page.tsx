"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, StatCard, Badge } from "@/components/ui/Primitives";
import { LoadingBlock } from "@/components/dashboard/States";
import { Fish, MessageSquareWarning, MailOpen, KeyRound } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Overview {
  stats: { total: number; opened: number; clicked: number; submitted: number; reported: number; clickRate: number; reportRate: number; submitRate: number };
  departmentRisk: { department: string; avgRisk: number }[];
  riskiest: { user: { name: string; department: string }; score: number }[];
  safest: { user: { name: string; department: string }; score: number }[];
}

const FUNNEL_COLORS = ["#0f3457", "#0e8c82", "#dd9c07", "#e8544a"];

export default function ReportsPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/reports/overview")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <LoadingBlock />;

  const funnel = [
    { name: "Opened", value: data.stats.opened },
    { name: "Clicked", value: data.stats.clicked },
    { name: "Submitted", value: data.stats.submitted },
    { name: "Reported", value: data.stats.reported },
  ];

  return (
    <div>
      <PageHeader title="Reports" description="Deep dive into organizational phishing resilience." />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Emails delivered" value={data.stats.total} icon={<MailOpen size={18} />} tone="navy" />
          <StatCard label="Click rate" value={`${data.stats.clickRate}%`} icon={<Fish size={18} />} tone="coral" />
          <StatCard label="Credential submit rate" value={`${data.stats.submitRate}%`} icon={<KeyRound size={18} />} tone="amber" />
          <StatCard label="Report rate" value={`${data.stats.reportRate}%`} icon={<MessageSquareWarning size={18} />} tone="teal" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-display font-semibold text-slate-dark mb-4">Engagement funnel</h3>
            {data.stats.total === 0 ? (
              <p className="text-sm text-slate py-16 text-center">No campaign data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={funnel} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {funnel.map((_, i) => (
                      <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={30} iconSize={9} wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #dbe6ea", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-slate-dark mb-4">Risk by department</h3>
            {data.departmentRisk.length === 0 ? (
              <p className="text-sm text-slate py-16 text-center">No campaign data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.departmentRisk} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaf1f3" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#5e7787" }} />
                  <YAxis type="category" dataKey="department" width={90} tick={{ fontSize: 11, fill: "#5e7787" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #dbe6ea", fontSize: 12 }} />
                  <Bar dataKey="avgRisk" fill="#0e8c82" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-display font-semibold text-slate-dark mb-4">Needs coaching</h3>
            {data.riskiest.length === 0 ? (
              <p className="text-sm text-slate py-6 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.riskiest.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-dark">{r.user?.name}</p>
                      <p className="text-xs text-slate">{r.user?.department}</p>
                    </div>
                    <Badge tone={r.score >= 60 ? "high" : "medium"}>{r.score}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-slate-dark mb-4">Setting the standard</h3>
            {data.safest.length === 0 ? (
              <p className="text-sm text-slate py-6 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.safest.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-dark">{r.user?.name}</p>
                      <p className="text-xs text-slate">{r.user?.department}</p>
                    </div>
                    <Badge tone="low">{r.score}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

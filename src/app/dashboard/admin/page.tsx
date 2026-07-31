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
  totals: { totalSimulations: number; totalStudents: number; totalTemplates: number; totalModules: number };
  stats: { total: number; clickRate: number; reportRate: number; submitRate: number };
  trend: { name: string; clickRate: number; reportRate: number }[];
  departmentResilience: { department: string; avgResilience: number }[];
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
        description="Platform-wide phishing resilience and training progress."
        action={
          <Link
            href="/dashboard/admin/simulations/new"
            className="inline-flex items-center gap-1.5 bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
          >
            <Send size={15} />
            New simulation
          </Link>
        }
      />

      {!data ? (
        <LoadingBlock />
      ) : (
        <div className="p-4 md:p-8 space-y-6">
          {/* Compact grid cards on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Students enrolled" value={data.totals.totalStudents} icon={<Users size={18} />} tone="primary" />
            <StatCard
              label="Training completions"
              value={data.trainingCompletion}
              icon={<GraduationCap size={18} />}
              tone="warning"
            />
            {/* Full-width rectangles on mobile */}
            <StatCard
              label="Click rate"
              value={`${data.stats.clickRate}%`}
              sublabel="Across all simulations"
              icon={<Fish size={18} />}
              tone="danger"
            />
            <StatCard
              label="Report rate"
              value={`${data.stats.reportRate}%`}
              sublabel="Simulations reported"
              icon={<MessageSquareWarning size={18} />}
              tone="accent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-text-main">Click vs. report rate by simulation</h3>
              </div>
              {data.trend.length === 0 ? (
                <p className="text-sm text-text-muted py-12 text-center">Run a simulation to see trend data here.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#89A4B5" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#89A4B5" }} unit="%" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, backgroundColor: "#050810", color: "#F8FAFC" }}
                    />
                    <Line type="monotone" dataKey="clickRate" name="Clicked" stroke="#e8544a" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="reportRate" name="Reported" stroke="#0e8c82" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-display font-semibold text-text-main mb-4">Requires attention</h3>
              {data.riskiest.length === 0 ? (
                <p className="text-sm text-text-muted py-8 text-center">No simulation data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.riskiest.map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-main truncate">{r.user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{r.user?.department}</p>
                      </div>
                      <Badge tone={r.score >= 850 ? "success" : r.score >= 600 ? "low" : r.score >= 300 ? "medium" : "high"}>{r.score}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/dashboard/admin/students"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-4 hover:underline"
              >
                View all students <ArrowUpRight size={13} />
              </Link>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-primary-light" />
              <h3 className="font-display font-semibold text-text-main">Average resilience by department</h3>
            </div>
            {data.departmentResilience.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No simulation data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.departmentResilience}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#89A4B5" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#89A4B5" }} domain={[0, 1000]} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, backgroundColor: "#050810", color: "#F8FAFC" }} />
                  <Bar dataKey="avgResilience" name="Avg. resilience" fill="#0f3457" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Fish, MessageSquareWarning } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDate, formatDateTime } from "@/lib/utils";

interface SimulationResult {
  _id: string;
  userId: { _id: string; name: string; email: string; department: string };
  emailSentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  submittedAt: string | null;
  reportedAt: string | null;
}

interface Simulation {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  templateId: { _id: string; name: string; subject: string };
  targetDepartments: string[];
}

export default function SimulationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{ simulation: Simulation; results: SimulationResult[] } | null>(null);

  useEffect(() => {
    fetch(`/api/simulations/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d));
  }, [id]);

  if (!data) return <LoadingBlock />;

  const { simulation, results } = data;
  const total = results.length;
  const clicked = results.filter((r) => r.clickedAt).length;
  const submitted = results.filter((r) => r.submittedAt).length;
  const reported = results.filter((r) => r.reportedAt).length;

  const clickRate = total > 0 ? Math.round((clicked / total) * 100) : 0;
  const reportRate = total > 0 ? Math.round((reported / total) * 100) : 0;
  const submitRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title={simulation.name}
        description={`Template: ${simulation.templateId.name}`}
        action={
          <Link
            href="/dashboard/admin/simulations"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        }
      />

      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-text-muted">Targets</p>
            <p className="font-display text-2xl md:text-4xl font-bold text-text-main mt-1 md:mt-2">{total}</p>
          </Card>
          <Card className="p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-text-muted">Click Rate</p>
            <p className="font-display text-2xl md:text-4xl font-bold text-danger mt-1 md:mt-2">{clickRate}%</p>
          </Card>
          <Card className="p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-text-muted">Submit Rate</p>
            <p className="font-display text-2xl md:text-4xl font-bold text-warning mt-1 md:mt-2">{submitRate}%</p>
          </Card>
          <Card className="p-4 md:p-6">
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-text-muted">Report Rate</p>
            <p className="font-display text-2xl md:text-4xl font-bold text-accent mt-1 md:mt-2">{reportRate}%</p>
          </Card>
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border-dim bg-background/50">
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Department</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Sent</th>
                <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim">
              {results.map((r) => {
                let statusBadge = <Badge tone="neutral">Safe</Badge>;
                if (r.submittedAt) statusBadge = <Badge tone="high">Submitted</Badge>;
                else if (r.clickedAt) statusBadge = <Badge tone="medium">Clicked</Badge>;
                else if (r.reportedAt) statusBadge = <Badge tone="success">Reported</Badge>;

                return (
                  <tr key={r._id} className="hover:bg-background-muted/50 transition-colors">
                    <td className="p-4">
                      <p className="text-sm font-medium text-text-main">{r.userId?.name}</p>
                      <p className="text-xs text-text-muted">{r.userId?.email}</p>
                    </td>
                    <td className="p-4 text-sm text-text-muted">{r.userId?.department}</td>
                    <td className="p-4 text-sm text-text-muted">{formatDateTime(r.emailSentAt)}</td>
                    <td className="p-4">{statusBadge}</td>
                  </tr>
                );
              })}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-text-muted">
                    No targets found for this simulation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

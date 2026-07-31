"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Fish } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock, EmptyState } from "@/components/dashboard/States";
import { formatDate } from "@/lib/utils";

interface CampaignRow {
  _id: string;
  name: string;
  status: string;
  templateId: { name: string; category: string } | null;
  createdAt: string;
  stats: { total: number; clicked: number; reported: number; opened: number };
}

const statusTone: Record<string, "neutral" | "info" | "success" | "medium"> = {
  draft: "neutral",
  scheduled: "info",
  running: "medium",
  completed: "success",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[] | null>(null);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((d) => setCampaigns(d.campaigns));
  }, []);

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Create and monitor phishing simulation campaigns."
        action={
          <Link
            href="/dashboard/admin/campaigns/new"
            className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-glow shadow-md shadow-primary-glow/20 transition-all duration-200"
          >
            <Send size={15} />
            New campaign
          </Link>
        }
      />

      <div className="p-8">
        {!campaigns ? (
          <LoadingBlock />
        ) : campaigns.length === 0 ? (
          <Card>
            <EmptyState
              title="No campaigns yet"
              description="Launch your first simulated phishing campaign to start measuring click and report rates."
              action={
                <Link
                  href="/dashboard/admin/campaigns/new"
                  className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-glow shadow-md shadow-primary-glow/20 transition-all duration-200"
                >
                  <Fish size={15} />
                  Create a campaign
                </Link>
              }
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-hover text-left text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Campaign</th>
                  <th className="px-5 py-3 font-medium">Template</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Targets</th>
                  <th className="px-5 py-3 font-medium">Clicked</th>
                  <th className="px-5 py-3 font-medium">Reported</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-hover/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/admin/campaigns/${c._id}`} className="font-semibold text-white hover:text-primary-glow">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-text-muted">{c.templateId?.name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={statusTone[c.status] ?? "neutral"}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-white font-mono-data">{c.stats.total}</td>
                    <td className="px-5 py-3.5 text-white font-mono-data">
                      {c.stats.total > 0 ? Math.round((c.stats.clicked / c.stats.total) * 100) : 0}%
                    </td>
                    <td className="px-5 py-3.5 text-white font-mono-data">
                      {c.stats.total > 0 ? Math.round((c.stats.reported / c.stats.total) * 100) : 0}%
                    </td>
                    <td className="px-5 py-3.5 text-text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

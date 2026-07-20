"use client";

import { useEffect, useState, use } from "react";
import { Send, MailOpen, MousePointerClick, KeyRound, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge, StatCard } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDateTime } from "@/lib/utils";

interface Target {
  _id: string;
  userId: { name: string; email: string; department: string } | null;
  emailSentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  submittedAt: string | null;
  reportedAt: string | null;
}

interface CampaignDetail {
  campaign: {
    _id: string;
    name: string;
    description?: string;
    status: string;
    templateId: { name: string; subject: string; category: string };
    createdAt: string;
    sentAt?: string;
  };
  targets: Target[];
}

function targetStatus(t: Target) {
  if (t.reportedAt) return { label: "Reported", tone: "success" as const };
  if (t.submittedAt) return { label: "Submitted data", tone: "high" as const };
  if (t.clickedAt) return { label: "Clicked", tone: "medium" as const };
  if (t.openedAt) return { label: "Opened", tone: "info" as const };
  if (t.emailSentAt) return { label: "Sent", tone: "neutral" as const };
  return { label: "Pending", tone: "neutral" as const };
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  async function load() {
    const res = await fetch(`/api/campaigns/${id}`);
    const d = await res.json();
    setData(d);
  }

  async function handleSend() {
    setSending(true);
    setSendResult(null);
    const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
    const d = await res.json();
    setSending(false);
    if (res.ok) {
      setSendResult(
        d.simulatedCount > 0
          ? `Sent to ${d.sent} employees (simulated — configure SMTP to deliver real emails).`
          : `Sent to ${d.sent} employees.`
      );
      load();
    } else {
      setSendResult(d.error ?? "Failed to send.");
    }
  }

  if (!data) return <LoadingBlock />;

  const { campaign, targets } = data;
  const total = targets.length;
  const opened = targets.filter((t) => t.openedAt).length;
  const clicked = targets.filter((t) => t.clickedAt).length;
  const reported = targets.filter((t) => t.reportedAt).length;

  return (
    <div>
      <PageHeader
        title={campaign.name}
        description={campaign.templateId ? `Using template "${campaign.templateId.name}"` : undefined}
        action={
          campaign.status === "draft" ? (
            <Button onClick={handleSend} disabled={sending}>
              <Send size={15} className="mr-1.5" />
              {sending ? "Sending…" : "Send campaign"}
            </Button>
          ) : (
            <Badge tone={campaign.status === "completed" ? "success" : "info"}>{campaign.status}</Badge>
          )
        }
      />

      <div className="p-8 space-y-6">
        {sendResult && (
          <div className="text-sm bg-teal/10 border border-teal/20 text-teal rounded-lg px-4 py-3">{sendResult}</div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Targets" value={total} icon={<ShieldCheck size={18} />} tone="navy" />
          <StatCard label="Opened" value={`${total > 0 ? Math.round((opened / total) * 100) : 0}%`} icon={<MailOpen size={18} />} tone="teal" />
          <StatCard
            label="Clicked"
            value={`${total > 0 ? Math.round((clicked / total) * 100) : 0}%`}
            icon={<MousePointerClick size={18} />}
            tone="coral"
          />
          <StatCard
            label="Reported"
            value={`${total > 0 ? Math.round((reported / total) * 100) : 0}%`}
            icon={<KeyRound size={18} />}
            tone="amber"
          />
        </div>

        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="font-display font-semibold text-slate-dark">Recipients</h3>
          </div>
          <div className="overflow-x-auto styled-scroll">
            <table className="w-full text-sm">
              <thead className="bg-mist/60 text-left text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Sent</th>
                  <th className="px-5 py-3 font-medium">Clicked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {targets.map((t) => {
                  const status = targetStatus(t);
                  return (
                    <tr key={t._id}>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-slate-dark">{t.userId?.name ?? "Unknown"}</p>
                        <p className="text-xs text-slate">{t.userId?.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate">{t.userId?.department}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate text-xs font-mono-data">{formatDateTime(t.emailSentAt)}</td>
                      <td className="px-5 py-3.5 text-slate text-xs font-mono-data">{formatDateTime(t.clickedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

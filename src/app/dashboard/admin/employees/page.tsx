"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/States";
import { riskLabel, initials } from "@/lib/utils";

interface EmployeeRow {
  _id: string;
  name: string;
  email: string;
  department: string;
  jobTitle?: string;
  riskScore: number;
  trainingCompleted: number;
  campaignStats: { totalCampaigns: number; clicked: number; reported: number };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(false);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []));
  }, []);

  const filtered = employees?.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) || e.department.toLowerCase().includes(query.toLowerCase())
  );

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInviteError(null);
    setInviteLink(null);
    setInvitePending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      department: formData.get("department"),
      jobTitle: formData.get("jobTitle"),
    };

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    setInvitePending(false);

    if (!res.ok) {
      setInviteError(data.error ?? "Something went wrong.");
      return;
    }

    setInviteLink(`${window.location.origin}${data.invitePath}`);
    form.reset();
  }

  return (
    <div>
      <PageHeader title="Employees" description="Invite employees and review simulation risk by person." />

      <div className="p-8">
        <Card className="mb-5 p-5">
          <form onSubmit={handleInvite} className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] lg:items-end">
            <div>
              <label htmlFor="invite-name" className="text-sm font-semibold text-white">
                Name
              </label>
              <input
                id="invite-name"
                name="name"
                placeholder="Jamie Chen"
                className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="invite-email" className="text-sm font-semibold text-white">
                Email
              </label>
              <input
                id="invite-email"
                name="email"
                type="email"
                required
                placeholder="jamie@company.com"
                className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="invite-department" className="text-sm font-semibold text-white">
                Department
              </label>
              <input
                id="invite-department"
                name="department"
                required
                placeholder="Engineering"
                className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="invite-job-title" className="text-sm font-semibold text-white">
                Job title
              </label>
              <input
                id="invite-job-title"
                name="jobTitle"
                placeholder="Analyst"
                className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button type="submit" disabled={invitePending}>
              <UserPlus size={16} />
              {invitePending ? "Creating..." : "Invite"}
            </Button>
          </form>

          {inviteError ? (
            <p className="mt-3 rounded-lg border border-coral/20 bg-coral/10 px-3 py-2 text-sm text-coral">{inviteError}</p>
          ) : null}

          {inviteLink ? (
            <div className="mt-3 flex flex-col gap-2 rounded-lg border border-teal/20 bg-teal/5 p-3 sm:flex-row sm:items-center">
              <input
                readOnly
                value={inviteLink}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(inviteLink)}>
                <Copy size={14} />
                Copy
              </Button>
            </div>
          ) : null}
        </Card>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or department…"
          className="w-full max-w-xs mb-5 rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />

        {!filtered ? (
          <LoadingBlock />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-hover text-left text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Campaigns</th>
                  <th className="px-5 py-3 font-medium">Training completed</th>
                  <th className="px-5 py-3 font-medium">Risk score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => {
                  const { label, tone } = riskLabel(e.riskScore);
                  return (
                    <tr key={e._id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/admin/employees/${e._id}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/30 shadow-inner flex items-center justify-center text-xs font-semibold font-mono-data">
                            {initials(e.name)}
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-primary-glow transition-colors">{e.name}</p>
                            <p className="text-xs text-text-muted">{e.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-text-muted">{e.department}</td>
                      <td className="px-5 py-3.5 text-white font-mono-data">{e.campaignStats.totalCampaigns}</td>
                      <td className="px-5 py-3.5 text-white font-mono-data">{e.trainingCompleted}</td>
                      <td className="px-5 py-3.5">
                        <Badge tone={tone}>
                          {e.riskScore} · {label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
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

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []));
  }, []);

  const filtered = employees?.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) || e.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Employees" description="Risk score is based on click, submission, and report history." />

      <div className="p-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or department…"
          className="w-full max-w-xs mb-5 rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />

        {!filtered ? (
          <LoadingBlock />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist/60 text-left text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="px-5 py-3 font-medium">Employee</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Campaigns</th>
                  <th className="px-5 py-3 font-medium">Training completed</th>
                  <th className="px-5 py-3 font-medium">Risk score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((e) => {
                  const { label, tone } = riskLabel(e.riskScore);
                  return (
                    <tr key={e._id} className="hover:bg-mist/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/admin/employees/${e._id}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center text-xs font-semibold font-mono-data">
                            {initials(e.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-dark group-hover:text-teal transition-colors">{e.name}</p>
                            <p className="text-xs text-slate">{e.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate">{e.department}</td>
                      <td className="px-5 py-3.5 text-slate-dark font-mono-data">{e.campaignStats.totalCampaigns}</td>
                      <td className="px-5 py-3.5 text-slate-dark font-mono-data">{e.trainingCompleted}</td>
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock, EmptyState } from "@/components/dashboard/States";

interface ModuleRow {
  _id: string;
  title: string;
  summary: string;
  category: string;
  estimatedMinutes: number;
  progress: { status: "not_started" | "in_progress" | "completed"; score?: number };
}

const statusMeta = {
  not_started: { label: "Not started", tone: "neutral" as const, icon: PlayCircle },
  in_progress: { label: "In progress", tone: "info" as const, icon: PlayCircle },
  completed: { label: "Completed", tone: "success" as const, icon: CheckCircle2 },
};

export default function EmployeeTrainingListPage() {
  const [modules, setModules] = useState<ModuleRow[] | null>(null);

  useEffect(() => {
    fetch("/api/training")
      .then((r) => r.json())
      .then((d) => setModules(d.modules ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="My training" description="Short lessons to help you spot real threats." />

      <div className="p-8">
        {!modules ? (
          <LoadingBlock />
        ) : modules.length === 0 ? (
          <Card>
            <EmptyState title="No training assigned yet" description="Check back soon." />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => {
              const meta = statusMeta[m.progress?.status ?? "not_started"];
              const Icon = meta.icon;
              return (
                <Link key={m._id} href={`/dashboard/employee/training/${m._id}`}>
                  <Card className="p-5 h-full flex flex-col hover:border-teal/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <Icon size={17} className={meta.tone === "success" ? "text-teal" : "text-slate"} />
                    </div>
                    <h3 className="font-display font-semibold text-slate-dark mt-3">{m.title}</h3>
                    <p className="text-sm text-slate mt-1.5 line-clamp-2 flex-1">{m.summary}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate mt-4 pt-4 border-t border-line">
                      <Clock size={12} />
                      {m.estimatedMinutes} min · {m.category}
                      {m.progress?.score != null && (
                        <span className="ml-auto font-mono-data font-medium text-slate-dark">{m.progress.score}%</span>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

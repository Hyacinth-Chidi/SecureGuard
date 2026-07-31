"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Clock, Users2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock, EmptyState } from "@/components/dashboard/States";

interface ModuleRow {
  _id: string;
  title: string;
  summary: string;
  category: string;
  estimatedMinutes: number;
  published: boolean;
  completions: number;
  avgScore: number;
  totalEmployees: number;
  isSystem?: boolean;
}

export default function TrainingListPage() {
  const [modules, setModules] = useState<ModuleRow[] | null>(null);

  function load() {
    fetch("/api/training")
      .then((r) => r.json())
      .then((d) => setModules(d.modules ?? []));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this training module and all employee progress on it?")) return;
    await fetch(`/api/training/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Training"
        description="Security awareness modules assigned to employees."
        action={
          <Link
            href="/dashboard/admin/training/new"
            className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-glow shadow-md shadow-primary-glow/20 transition-all duration-200"
          >
            <Plus size={15} />
            New module
          </Link>
        }
      />

      <div className="p-4 md:p-8">
        {!modules ? (
          <LoadingBlock />
        ) : modules.length === 0 ? (
          <Card>
            <EmptyState title="No training modules yet" description="Create your first awareness training module." />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <Card key={m._id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <Badge tone={m.published ? "success" : "neutral"}>{m.published ? "Published" : "Draft"}</Badge>
                    {m.isSystem && <Badge tone="info">System</Badge>}
                  </div>
                  {!m.isSystem && (
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-text-muted hover:text-danger transition-colors"
                      aria-label="Delete module"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <Link href={`/dashboard/admin/training/${m._id}`} className="mt-3 group">
                  <h3 className="font-display font-semibold text-white group-hover:text-primary-glow transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-sm font-medium text-text-muted mt-1.5 line-clamp-2">{m.summary}</p>
                </Link>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs font-medium text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {m.estimatedMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users2 size={12} />
                    {m.completions}/{m.totalEmployees} completed
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock, EmptyState } from "@/components/dashboard/States";

interface TemplateRow {
  _id: string;
  name: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  subject: string;
  isSystem?: boolean;
}

const difficultyTone = { easy: "low", medium: "medium", hard: "high" } as const;

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRow[] | null>(null);

  function load() {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
  }

  useEffect(load, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this template? Campaigns already using it are unaffected.")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Reusable phishing email templates used to build campaigns."
        action={
          <Link
            href="/dashboard/admin/templates/new"
            className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-glow shadow-md shadow-primary-glow/20 transition-all duration-200"
          >
            <Plus size={15} />
            New template
          </Link>
        }
      />

      <div className="p-4 md:p-8">
        {!templates ? (
          <LoadingBlock />
        ) : templates.length === 0 ? (
          <Card>
            <EmptyState title="No templates yet" description="Create a phishing email template to use in campaigns." />
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <Card key={t._id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <Badge tone={difficultyTone[t.difficulty]}>{t.difficulty}</Badge>
                    {t.isSystem && <Badge tone="info">System</Badge>}
                  </div>
                  {!t.isSystem && (
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-text-muted hover:text-danger transition-colors"
                      aria-label="Delete template"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <Link href={`/dashboard/admin/templates/${t._id}`} className="mt-3 group">
                  <h3 className="font-display font-semibold text-white group-hover:text-primary-glow transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs font-medium text-text-muted mt-1">{t.category}</p>
                  <p className="text-sm font-medium text-text-muted mt-3 line-clamp-2">&ldquo;{t.subject}&rdquo;</p>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

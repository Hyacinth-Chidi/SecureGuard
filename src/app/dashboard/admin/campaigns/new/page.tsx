"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";

interface Template {
  _id: string;
  name: string;
  category: string;
  difficulty: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
    fetch("/api/employees")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees ?? []));
  }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  function toggleDept(dept: string) {
    setSelectedDepts((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!templateId) {
      setError("Choose a phishing template.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        templateId,
        targetDepartments: selectedDepts,
        targetUserIds: [],
      }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong.");
      return;
    }
    const { campaign } = await res.json();
    router.push(`/dashboard/admin/campaigns/${campaign._id}`);
  }

  const targetCount =
    selectedDepts.length === 0 ? employees.length : employees.filter((e) => selectedDepts.includes(e.department)).length;

  return (
    <div>
      <PageHeader title="New campaign" description="Choose a template and pick who receives it." />

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-dark">Campaign name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Q3 IT Helpdesk Simulation"
                className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-dark">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="What is this campaign testing for?"
                className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
          </Card>

          <Card className="p-6">
            <label className="text-sm font-medium text-slate-dark">Phishing template</label>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {templates.map((t) => (
                <label
                  key={t._id}
                  className={`border rounded-lg p-3.5 cursor-pointer transition-colors ${
                    templateId === t._id ? "border-teal bg-teal/5" : "border-line hover:border-slate/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={t._id}
                    checked={templateId === t._id}
                    onChange={() => setTemplateId(t._id)}
                    className="sr-only"
                  />
                  <p className="text-sm font-medium text-slate-dark">{t.name}</p>
                  <p className="text-xs text-slate mt-0.5">
                    {t.category} · {t.difficulty}
                  </p>
                </label>
              ))}
            </div>
            {templates.length === 0 && (
              <p className="text-sm text-slate mt-3">No templates yet — create one in the Templates tab first.</p>
            )}
          </Card>

          <Card className="p-6">
            <label className="text-sm font-medium text-slate-dark">Target audience</label>
            <p className="text-xs text-slate mt-1 mb-3">Leave all unchecked to target every active employee.</p>
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <button
                  type="button"
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    selectedDepts.includes(dept)
                      ? "bg-navy text-white border-navy"
                      : "border-line text-slate-dark hover:border-slate/40"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate mt-3">
              This will target <span className="font-mono-data font-medium text-slate-dark">{targetCount}</span> employee
              {targetCount === 1 ? "" : "s"}.
            </p>
          </Card>

          {error && <p className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

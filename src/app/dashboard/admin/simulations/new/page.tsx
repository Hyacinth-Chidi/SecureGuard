"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/States";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewSimulationPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<{ _id: string; name: string }[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    templateId: "",
    targetDepartment: "All",
  });

  const [departments, setDepartments] = useState<string[]>([
    "All",
    "Engineering",
    "Finance",
    "HR",
    "Marketing",
    "Sales",
    "Student",
    "IT",
    "General",
  ]);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates));

    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.students)) {
          const depts = new Set<string>(["All"]);
          d.students.forEach((s: any) => {
            if (s.department && s.department.trim()) {
              depts.add(s.department.trim());
            }
          });
          setDepartments(Array.from(depts));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create simulation");

      router.push(`/dashboard/admin/simulations/${data.simulation._id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New Simulation"
        description="Launch a new phishing campaign."
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

      <div className="p-4 md:p-8">
        <Card className="p-6 max-w-2xl mx-auto">
          {!templates ? (
            <LoadingBlock />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="p-3 bg-danger/10 text-danger rounded-md text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Simulation Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Q3 Password Reset Test"
                  className="w-full bg-background-muted border border-border-dim rounded-md px-3 py-2 text-text-main focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Email Template</label>
                <select
                  required
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full bg-background-muted border border-border-dim rounded-md px-3 py-2 text-text-main focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="" disabled className="bg-background">
                    Select a template...
                  </option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id} className="bg-background">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">Target Department</label>
                <select
                  required
                  value={formData.targetDepartment}
                  onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                  className="w-full bg-background-muted border border-border-dim rounded-md px-3 py-2 text-text-main focus:outline-none focus:border-primary transition-colors"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-background">
                      {dept}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-text-muted mt-2">
                  Select &quot;All&quot; to target all students, or choose a specific department.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" disabled={loading || !formData.templateId || !formData.name}>
                  {loading ? "Launching..." : "Launch Simulation"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

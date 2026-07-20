"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";

export interface TemplateFormValues {
  name: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  fromName: string;
  fromEmail: string;
  subject: string;
  htmlBody: string;
  landingHeadline: string;
  landingBody: string;
  redFlags: string[];
}

const defaultValues: TemplateFormValues = {
  name: "",
  category: "General",
  difficulty: "medium",
  fromName: "",
  fromEmail: "",
  subject: "",
  htmlBody:
    '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">\n  <p>Hi {{first_name}},</p>\n  <p>Write your simulated phishing message here.</p>\n  <p style="text-align:center;margin:24px 0">\n    <a href="{{tracking_link}}" style="background:#1a5276;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Take Action</a>\n  </p>\n</div>',
  landingHeadline: "You just fell for a simulated phishing test",
  landingBody: "",
  redFlags: [],
};

export function TemplateForm({
  initial,
  templateId,
}: {
  initial?: Partial<TemplateFormValues>;
  templateId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TemplateFormValues>({ ...defaultValues, ...initial });
  const [redFlagsText, setRedFlagsText] = useState((initial?.redFlags ?? []).join("\n"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update<K extends keyof TemplateFormValues>(key: K, value: TemplateFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const payload = {
      ...values,
      redFlags: redFlagsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const res = templateId
      ? await fetch(`/api/templates/${templateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setPending(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong.");
      return;
    }
    router.push("/dashboard/admin/templates");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card className="p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-dark">Template name</label>
          <input
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">Category</label>
          <input
            required
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">Difficulty</label>
          <select
            value={values.difficulty}
            onChange={(e) => update("difficulty", e.target.value as TemplateFormValues["difficulty"])}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 bg-white"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">From name</label>
          <input
            required
            value={values.fromName}
            onChange={(e) => update("fromName", e.target.value)}
            placeholder="IT Support Desk"
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">From email</label>
          <input
            required
            type="email"
            value={values.fromEmail}
            onChange={(e) => update("fromEmail", e.target.value)}
            placeholder="it-support@example-alerts.com"
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">Subject line</label>
          <input
            required
            value={values.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
      </Card>

      <Card className="p-6">
        <label className="text-sm font-medium text-slate-dark">Email HTML body</label>
        <p className="text-xs text-slate mt-1 mb-2">
          Use <code className="font-mono-data bg-mist px-1 rounded">{"{{first_name}}"}</code> and{" "}
          <code className="font-mono-data bg-mist px-1 rounded">{"{{tracking_link}}"}</code> as placeholders.
        </p>
        <textarea
          required
          rows={10}
          value={values.htmlBody}
          onChange={(e) => update("htmlBody", e.target.value)}
          className="w-full rounded-lg border border-line px-3.5 py-2.5 text-xs font-mono-data outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-dark">Landing page headline</label>
          <input
            required
            value={values.landingHeadline}
            onChange={(e) => update("landingHeadline", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">Teachable-moment explanation</label>
          <textarea
            required
            rows={3}
            value={values.landingBody}
            onChange={(e) => update("landingBody", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-dark">Red flags (one per line)</label>
          <textarea
            rows={4}
            value={redFlagsText}
            onChange={(e) => setRedFlagsText(e.target.value)}
            placeholder={"Sender domain doesn't match the real company\nCreates urgency"}
            className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
      </Card>

      {error && <p className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : templateId ? "Save changes" : "Create template"}
        </Button>
      </div>
    </form>
  );
}

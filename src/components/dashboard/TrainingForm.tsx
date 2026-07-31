"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TrainingFormValues {
  title: string;
  summary: string;
  content: string;
  category: string;
  estimatedMinutes: number;
  quiz: QuizQuestion[];
  published: boolean;
}

const defaultValues: TrainingFormValues = {
  title: "",
  summary: "",
  content: "",
  category: "General",
  estimatedMinutes: 5,
  quiz: [],
  published: true,
};

export function TrainingForm({ initial, moduleId }: { initial?: Partial<TrainingFormValues>; moduleId?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<TrainingFormValues>({ ...defaultValues, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update<K extends keyof TrainingFormValues>(key: K, value: TrainingFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addQuestion() {
    update("quiz", [...values.quiz, { question: "", options: ["", ""], correctIndex: 0 }]);
  }

  function updateQuestion(i: number, patch: Partial<QuizQuestion>) {
    const next = [...values.quiz];
    next[i] = { ...next[i], ...patch };
    update("quiz", next);
  }

  function removeQuestion(i: number) {
    update("quiz", values.quiz.filter((_, idx) => idx !== i));
  }

  function updateOption(qi: number, oi: number, value: string) {
    const next = [...values.quiz];
    const options = [...next[qi].options];
    options[oi] = value;
    next[qi] = { ...next[qi], options };
    update("quiz", next);
  }

  function addOption(qi: number) {
    const next = [...values.quiz];
    next[qi] = { ...next[qi], options: [...next[qi].options, ""] };
    update("quiz", next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const res = moduleId
      ? await fetch(`/api/training/${moduleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        })
      : await fetch("/api/training", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

    setPending(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Something went wrong.");
      return;
    }
    router.push("/dashboard/admin/training");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card className="p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white">Title</label>
          <input
            required
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-white">Summary</label>
          <input
            required
            value={values.summary}
            onChange={(e) => update("summary", e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-white">Category</label>
          <input
            required
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-white">Estimated minutes</label>
          <input
            required
            type="number"
            min={1}
            value={values.estimatedMinutes}
            onChange={(e) => update("estimatedMinutes", Number(e.target.value))}
            className="mt-2 w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <label className="flex items-center gap-2 sm:col-span-2 text-sm text-slate-dark">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => update("published", e.target.checked)}
            className="rounded border-line"
          />
          Published (visible to employees)
        </label>
      </Card>

      <Card className="p-6">
        <label className="text-sm font-semibold text-white">Lesson content</label>
        <p className="text-xs text-text-muted mt-1 mb-2">Plain text or simple paragraphs, shown to employees as the lesson.</p>
        <textarea
          required
          rows={10}
          value={values.content}
          onChange={(e) => update("content", e.target.value)}
          className="w-full rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-white">Quiz questions</label>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus size={13} />
            Add question
          </button>
        </div>

        {values.quiz.length === 0 && <p className="text-sm text-slate">No quiz yet — module will auto-complete at 100%.</p>}

        <div className="space-y-5">
          {values.quiz.map((q, qi) => (
            <div key={qi} className="border border-border rounded-lg p-4">
              <div className="flex items-start gap-2">
                <input
                  required
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                  placeholder={`Question ${qi + 1}`}
                  className="flex-1 rounded-xl bg-surface/50 border border-border px-4 py-3 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button type="button" onClick={() => removeQuestion(qi)} className="text-text-muted hover:text-danger mt-2">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(qi, { correctIndex: oi })}
                    />
                    <input
                      required
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 rounded-xl bg-surface/50 border border-border px-3 py-1.5 text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(qi)}
                  className="text-xs font-medium text-primary hover:underline ml-6"
                >
                  + Add option
                </button>
              </div>
              <p className="text-[11px] text-slate mt-2 ml-6">Select the radio button next to the correct answer.</p>
            </div>
          ))}
        </div>
      </Card>

      {error && <p className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : moduleId ? "Save changes" : "Create module"}
        </Button>
      </div>
    </form>
  );
}

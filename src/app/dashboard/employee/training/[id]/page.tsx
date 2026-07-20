"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/States";

interface QuizQuestion {
  question: string;
  options: string[];
}

interface ModuleData {
  _id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  quiz: QuizQuestion[];
  progress?: { status: string; score?: number };
}

export default function EmployeeTrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ModuleData | null>(null);
  const [stage, setStage] = useState<"lesson" | "quiz" | "result">("lesson");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.module);
        if (d.module?.progress?.status === "completed" || d.progress?.status === "completed") {
          setResult({ score: d.progress?.score ?? d.module?.progress?.score ?? 0, correct: 0, total: d.module?.quiz?.length ?? 0 });
          setStage("result");
        }
      });
  }, [id]);

  async function handleQuizSubmit() {
    setSubmitting(true);
    const res = await fetch(`/api/training/${id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const d = await res.json();
    setSubmitting(false);
    setResult(d);
    setStage("result");
  }

  if (!data) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title={data.title}
        description={data.category}
        action={
          <Link
            href="/dashboard/employee/training"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate hover:text-slate-dark"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        }
      />

      <div className="p-8 max-w-2xl">
        {stage === "lesson" && (
          <Card className="p-7">
            <p className="text-sm text-slate leading-relaxed whitespace-pre-line">{data.content}</p>
            <div className="mt-7">
              {data.quiz.length > 0 ? (
                <Button onClick={() => setStage("quiz")}>Take the quiz</Button>
              ) : (
                <Button
                  onClick={async () => {
                    setSubmitting(true);
                    const res = await fetch(`/api/training/${id}/progress`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ answers: [] }),
                    });
                    const d = await res.json();
                    setSubmitting(false);
                    setResult(d);
                    setStage("result");
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Mark as complete"}
                </Button>
              )}
            </div>
          </Card>
        )}

        {stage === "quiz" && (
          <Card className="p-7 space-y-6">
            {data.quiz.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-medium text-slate-dark mb-2.5">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex items-center gap-2.5 text-sm text-slate-dark border border-line rounded-lg px-3.5 py-2.5 cursor-pointer hover:bg-mist/40"
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={answers[qi] === oi}
                        onChange={() => {
                          const next = [...answers];
                          next[qi] = oi;
                          setAnswers(next);
                        }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={handleQuizSubmit} disabled={submitting || answers.length < data.quiz.length}>
              {submitting ? "Submitting…" : "Submit answers"}
            </Button>
          </Card>
        )}

        {stage === "result" && result && (
          <Card className="p-8 text-center">
            {result.score >= 70 ? (
              <CheckCircle2 className="mx-auto text-teal mb-3" size={36} />
            ) : (
              <XCircle className="mx-auto text-coral mb-3" size={36} />
            )}
            <h2 className="font-display text-xl font-semibold text-slate-dark">
              {result.total > 0 ? `You scored ${result.score}%` : "Module complete"}
            </h2>
            {result.total > 0 && (
              <p className="text-sm text-slate mt-1.5">
                {result.correct} of {result.total} correct
              </p>
            )}
            <Badge tone={result.score >= 70 ? "success" : "medium"}>
              {result.score >= 70 ? "Passed" : "Review recommended"}
            </Badge>
            <div className="mt-6">
              <Link href="/dashboard/employee/training">
                <Button variant="ghost">Back to training</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

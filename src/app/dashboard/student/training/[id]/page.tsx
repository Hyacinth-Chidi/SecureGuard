"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Award } from "lucide-react";
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

export default function StudentTrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ModuleData | null>(null);
  const [lockedInfo, setLockedInfo] = useState<{ _id: string; title: string } | null>(null);
  const [stage, setStage] = useState<"lesson" | "quiz" | "result">("lesson");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.locked) {
          setData(d.module);
          setLockedInfo(d.prerequisite);
          return;
        }
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

  if (lockedInfo) {
    return (
      <div>
        <PageHeader title={data.title} description={data.category} />
        <div className="p-4 md:p-8 max-w-xl mx-auto">
          <Card className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 text-warning flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>
            <h2 className="font-display text-2xl font-bold text-text-main">Module Locked</h2>
            <p className="text-sm text-text-muted">
              You must complete <span className="text-white font-semibold">{lockedInfo.title}</span> before accessing this module.
            </p>
            <div className="pt-2">
              <Link href={`/dashboard/student/training/${lockedInfo._id}`}>
                <Button variant="primary">Go to Prerequisite Module</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={data.title}
        description={data.category}
        action={
          <Link
            href="/dashboard/student/training"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        }
      />

      <div className="p-4 md:p-8 max-w-2xl">
        {stage === "lesson" && (
          <Card className="p-7">
            <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">{data.content}</p>
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
                <p className="text-sm font-medium text-text-main mb-2.5">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex items-center gap-2.5 text-sm text-text-main border border-border rounded-lg px-3.5 py-2.5 cursor-pointer hover:bg-surface-hover"
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
          <Card className="p-8 text-center space-y-4">
            {result.score >= 70 ? (
              <CheckCircle2 className="mx-auto text-accent mb-3" size={40} />
            ) : (
              <XCircle className="mx-auto text-danger mb-3" size={40} />
            )}
            <h2 className="font-display text-2xl font-bold text-text-main">
              {result.total > 0 ? `You scored ${result.score}%` : "Module complete"}
            </h2>
            {result.total > 0 && (
              <p className="text-sm text-text-muted">
                {result.correct} of {result.total} correct
              </p>
            )}
            <div className="flex justify-center">
              <Badge tone={result.score >= 70 ? "success" : "medium"}>
                {result.score >= 70 ? "Passed" : "Review recommended"}
              </Badge>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <Link href="/dashboard/student/training">
                <Button variant="ghost">Back to training</Button>
              </Link>
              {result.score >= 70 && (
                <Link href={`/dashboard/student/training/${id}/certificate`}>
                  <Button variant="primary" className="gap-2">
                    <Award size={16} />
                    View Certificate
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, Badge } from "@/components/ui/Primitives";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import Link from "next/link";

export function CourseQuiz({ moduleId, quizData, backLink = "/courses" }: { moduleId: string, quizData: any[], backLink?: string }) {
  const [stage, setStage] = useState<"idle" | "quiz" | "result">("idle");
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if already completed
    fetch(`/api/training/${moduleId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.module?.progress?.status === "completed" || d.progress?.status === "completed") {
          setResult({ score: d.progress?.score ?? d.module?.progress?.score ?? 0, correct: 0, total: quizData.length });
          setStage("result");
        }
      })
      .catch(() => {});
  }, [moduleId, quizData.length]);

  async function handleQuizSubmit() {
    setSubmitting(true);
    const res = await fetch(`/api/training/${moduleId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const d = await res.json();
    setSubmitting(false);
    setResult(d);
    setStage("result");
  }

  if (stage === "idle") {
    return (
      <div className="mt-12 py-10 border-t border-border/50 text-center">
        <h3 className="font-display text-2xl font-bold text-white mb-4">Ready to test your knowledge?</h3>
        <p className="text-text-muted mb-6">Complete the short quiz to earn your certificate for this module.</p>
        <Button onClick={() => setStage("quiz")} size="lg">Start Quiz</Button>
      </div>
    );
  }

  if (stage === "result" && result) {
    return (
      <Card className="p-8 mt-12 text-center space-y-4 border-border/50 bg-surface/30">
        {result.score >= 70 ? (
          <CheckCircle2 className="mx-auto text-accent mb-3" size={48} />
        ) : (
          <XCircle className="mx-auto text-danger mb-3" size={48} />
        )}
        <h2 className="font-display text-3xl font-bold text-white">
          {result.total > 0 ? `You scored ${result.score}%` : "Module complete"}
        </h2>
        {result.total > 0 && (
          <p className="text-lg text-text-muted">
            {result.correct} of {result.total} correct
          </p>
        )}
        <div className="flex justify-center mt-2">
          <Badge tone={result.score >= 70 ? "success" : "medium"} className="px-4 py-1.5 text-sm">
            {result.score >= 70 ? "Passed" : "Review recommended"}
          </Badge>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {result.score >= 70 && (
            <Link href={`/dashboard/student/training/${moduleId}/certificate`}>
              <Button variant="primary" size="lg" className="gap-2">
                <Award size={18} />
                View Certificate
              </Button>
            </Link>
          )}
          <Link href={backLink}>
            <Button variant="ghost" size="lg">Back to training</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-border/50">
      <h3 className="font-display text-2xl font-bold text-white mb-8">Knowledge Check</h3>
      <div className="space-y-8">
        {quizData.map((q, qi) => (
          <div key={qi} className="bg-surface/30 border border-border/50 p-6 rounded-2xl">
            <p className="text-lg font-medium text-white mb-4">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-3">
              {q.options.map((opt: string, oi: number) => (
                <label
                  key={oi}
                  className={`flex items-center gap-3 text-base border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                    answers[qi] === oi 
                      ? "border-primary bg-primary/10 text-white" 
                      : "border-border/50 text-text-muted hover:border-border hover:bg-surface"
                  }`}
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
                    className="w-4 h-4 text-primary focus:ring-primary/20 bg-background border-border"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleQuizSubmit} 
            disabled={submitting || answers.length < quizData.length || answers.includes(undefined as any)}
            size="lg"
          >
            {submitting ? "Submitting…" : "Submit answers"}
          </Button>
        </div>
      </div>
    </div>
  );
}

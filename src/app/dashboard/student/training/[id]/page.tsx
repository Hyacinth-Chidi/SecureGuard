"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Shield, Award } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/dashboard/States";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CourseQuiz } from "@/app/courses/[id]/CourseQuiz";
import { InteractiveSimulationLab, SimulationTemplateData } from "@/components/dashboard/InteractiveSimulationLab";
import { formatDate } from "@/lib/utils";

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
  videoUrl?: string;
  featuredImage?: string;
  createdAt: string;
  estimatedMinutes: number;
  quiz: QuizQuestion[];
  simulationTemplate?: SimulationTemplateData;
  progress?: { status: string; score?: number };
}

function getYouTubeId(url: string) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export default function StudentTrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ModuleData | null>(null);
  const [lockedInfo, setLockedInfo] = useState<{ _id: string; title: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

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
        
        // If there's no quiz and it's completed, we can show a completion state
        if ((d.module?.progress?.status === "completed" || d.progress?.status === "completed") && d.module.quiz.length === 0) {
           setShowResult(true);
        }
      });
  }, [id]);

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

  const youtubeId = getYouTubeId(data.videoUrl || "");

  return (
    <div>
      <PageHeader
        title="Training Module"
        description="Complete this module to earn your certificate."
        action={
          <Link
            href="/dashboard/student/training"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main"
          >
            <ArrowLeft size={15} />
            Back to training
          </Link>
        }
      />

      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <Card className="p-6 md:p-10">
          {/* Article Header */}
          <div className="mb-10 text-center">
            <Badge tone="info" className="mb-6">{data.category || "General"}</Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
              {data.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-text-muted text-sm font-medium">
              <span className="flex items-center gap-2"><Clock size={16} /> {data.estimatedMinutes} min read</span>
              {data.createdAt && (
                <span className="flex items-center gap-2"><Calendar size={16} /> {formatDate(data.createdAt)}</span>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {data.featuredImage ? (
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl mb-12 border border-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.featuredImage} alt={data.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-[21/9] rounded-3xl bg-surface/50 border border-border/50 flex items-center justify-center mb-12 text-border">
              <Shield size={64} className="opacity-30" />
            </div>
          )}

          {/* Video Embedding */}
          {youtubeId && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border shadow-lg mb-12">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </div>
          )}

          {/* Markdown Content */}
          <article className="prose prose-invert prose-blue max-w-none prose-headings:font-display prose-headings:font-bold prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.content}
            </ReactMarkdown>
          </article>

          {/* Hands-on Interactive Threat Simulation Lab (if template attached) */}
          {data.simulationTemplate && (
            <InteractiveSimulationLab
              template={data.simulationTemplate}
              onComplete={() => {
                const quizSection = document.getElementById("course-quiz-section");
                if (quizSection) {
                  quizSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          )}

          {/* Quiz Section OR Mark Complete */}
          <div id="course-quiz-section">
            {data.quiz && data.quiz.length > 0 ? (
              <CourseQuiz moduleId={data._id} quizData={data.quiz} backLink="/dashboard/student/training" />
            ) : (
            <div className="mt-16 pt-8 border-t border-border/50 text-center">
              {showResult ? (
                 <div className="space-y-4">
                    <Award className="mx-auto text-accent" size={48} />
                    <h3 className="font-display text-3xl font-bold text-white">Module Complete!</h3>
                    <Link href={`/dashboard/student/training/${id}/certificate`}>
                      <Button variant="primary" size="lg" className="gap-2 mt-4">
                        <Award size={18} /> View Certificate
                      </Button>
                    </Link>
                 </div>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-bold text-white mb-4">Ready to complete?</h3>
                  <p className="text-text-muted mb-6">You've finished the material. Mark this module as complete to earn your certificate.</p>
                  <Button
                    size="lg"
                    disabled={submitting}
                    onClick={async () => {
                      setSubmitting(true);
                      await fetch(`/api/training/${id}/progress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ answers: [] }),
                      });
                      setSubmitting(false);
                      setShowResult(true);
                    }}
                  >
                    {submitting ? "Saving…" : "Mark as complete"}
                  </Button>
                </>
              )}
            </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

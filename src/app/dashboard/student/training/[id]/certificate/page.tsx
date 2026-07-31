"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Printer, ShieldCheck, Award, Calendar, CheckCircle2 } from "lucide-react";
import { LoadingBlock } from "@/components/dashboard/States";
import { Button } from "@/components/ui/Button";

interface CertificateData {
  studentName: string;
  moduleTitle: string;
  category: string;
  score: number;
  completedAt: string;
}

export default function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.module) {
          setError("Training module not found.");
          return;
        }
        if (d.progress?.status !== "completed") {
          setError("You must complete this module to view your certificate.");
          return;
        }
        setData({
          studentName: d.user?.name ?? "Student",
          moduleTitle: d.module.title,
          category: d.module.category,
          score: d.progress?.score ?? 100,
          completedAt: d.progress?.completedAt
            ? new Date(d.progress.completedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        });
      })
      .catch(() => setError("Failed to load certificate."));
  }, [id]);

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto text-center space-y-4">
        <p className="text-danger text-sm font-semibold">{error}</p>
        <Link href="/dashboard/student/training">
          <Button variant="ghost">Back to training</Button>
        </Link>
      </div>
    );
  }

  if (!data) return <LoadingBlock />;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top action bar (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/dashboard/student/training/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-main"
        >
          <ArrowLeft size={16} />
          Back to module
        </Link>
        <Button onClick={() => window.print()} variant="primary" className="gap-2">
          <Printer size={16} />
          Print / Save PDF
        </Button>
      </div>

      {/* Certificate Frame */}
      <div className="bg-[#050810] border-2 border-primary/40 rounded-3xl p-10 md:p-14 relative overflow-hidden shadow-2xl print:border-2 print:border-black print:bg-white print:text-black">
        {/* Glow corner effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 blur-[100px] pointer-events-none print:hidden" />

        {/* Inner border frame */}
        <div className="border border-border/60 rounded-2xl p-8 md:p-12 relative z-10 flex flex-col items-center text-center space-y-6 print:border-gray-300">
          {/* Header Branding */}
          <div className="flex items-center gap-3">
            <Image src="/assets/logo.png" alt="SecureGuard" width={40} height={40} className="rounded-xl shadow-md" />
            <span className="font-display text-2xl font-bold text-white tracking-tight print:text-black">SecureGuard</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25em] text-primary-glow font-bold print:text-blue-600">
              Certificate of Completion
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white pt-2 print:text-black">
              Cyber Awareness Mastery
            </h1>
          </div>

          <p className="text-sm text-text-muted max-w-md print:text-gray-600">
            This certifies that the recipient has successfully completed training and demonstrated proficiency in cybersecurity best practices.
          </p>

          {/* Student Name */}
          <div className="py-4 border-y border-border/40 w-full max-w-md print:border-gray-300">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1 print:text-gray-500">Awarded To</p>
            <p className="font-display text-2xl md:text-3xl font-bold text-accent print:text-emerald-700">{data.studentName}</p>
          </div>

          {/* Module Title & Details */}
          <div className="space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-wider print:text-gray-500">For Completing Course</p>
            <h2 className="font-display text-xl md:text-2xl font-bold text-white print:text-black">{data.moduleTitle}</h2>
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted pt-1 print:text-gray-600">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} className="text-primary-glow print:text-blue-600" />
                {data.category}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 size={14} className="text-accent print:text-emerald-600" />
                Score: {data.score}%
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {data.completedAt}
              </span>
            </div>
          </div>

          {/* Footer Signature line */}
          <div className="pt-8 flex justify-between items-end w-full max-w-lg text-xs text-text-muted border-t border-border/30 print:border-gray-300 print:text-gray-600">
            <div className="text-left">
              <div className="font-display font-bold text-white text-sm print:text-black">SecureGuard AI</div>
              <p>Automated Verification System</p>
            </div>
            <div className="flex items-center gap-1.5 text-primary-glow font-mono-data text-[11px] print:text-blue-600">
              <Award size={18} />
              VERIFIED AUTHENTIC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

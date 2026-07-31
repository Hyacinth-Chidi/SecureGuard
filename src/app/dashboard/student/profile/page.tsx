"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, Award, GraduationCap, CheckCircle2, Calendar, Mail, User as UserIcon } from "lucide-react";

interface ProfileData {
  user: {
    name: string;
    email: string;
    department: string;
    jobTitle?: string;
    createdAt: string;
  };
  resilienceScore: number;
  rating: { label: string; tone: "low" | "medium" | "high" | "success" };
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt: string | null;
  }[];
  stats: {
    totalSimulations: number;
    clicked: number;
    submitted: number;
    reported: number;
    completedCourses: number;
  };
  timeline: {
    id: string;
    type: "course" | "simulation";
    title: string;
    subtitle: string;
    date: string;
    status: string;
  }[];
}

export default function StudentProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <LoadingBlock />;

  const initials = data.user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      <PageHeader title="My Security Profile" description="Your personal security achievements, badges, and activity history." />

      <div className="p-4 md:p-8 space-y-6">
        {/* User Hero Card */}
        <Card className="p-5 md:p-8 relative overflow-hidden bg-gradient-to-r from-surface to-background border-border">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="w-20 h-20 rounded-full bg-primary/20 text-primary-glow border-2 border-primary/40 flex items-center justify-center text-2xl font-bold font-mono-data shadow-lg shadow-primary/10">
                {initials}
              </div>
              <div className="space-y-1">
                <h1 className="font-display text-2xl font-bold text-white tracking-tight">{data.user.name}</h1>
                <p className="text-sm text-text-muted">{data.user.jobTitle ?? "Student"} · {data.user.department}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted pt-1 justify-center md:justify-start">
                  <span className="flex items-center gap-1">
                    <Mail size={13} />
                    {data.user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    Joined {formatDate(data.user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="bg-surface-hover/80 border border-border/80 rounded-2xl p-5 text-center min-w-[200px] backdrop-blur-sm shadow-inner">
              <span className="text-xs uppercase tracking-wider text-text-muted font-bold block mb-1">Resilience Rating</span>
              <div className="text-3xl font-extrabold font-display text-white">
                {data.resilienceScore} <span className="text-xs font-normal text-text-muted">/ 1000</span>
              </div>
              <div className="mt-2 flex justify-center">
                <Badge tone={data.rating.tone}>{data.rating.label}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 text-center">
            <GraduationCap className="mx-auto text-primary-glow mb-2" size={24} />
            <p className="font-display text-2xl font-bold text-white">{data.stats.completedCourses}</p>
            <p className="text-xs text-text-muted mt-1">Courses Completed</p>
          </Card>
          <Card className="p-5 text-center">
            <ShieldCheck className="mx-auto text-accent mb-2" size={24} />
            <p className="font-display text-2xl font-bold text-white">{data.stats.reported}</p>
            <p className="text-xs text-text-muted mt-1">Phishing Reported</p>
          </Card>
          <Card className="p-5 text-center">
            <Award className="mx-auto text-warning mb-2" size={24} />
            <p className="font-display text-2xl font-bold text-white">
              {data.badges.filter((b) => b.earned).length}/{data.badges.length}
            </p>
            <p className="text-xs text-text-muted mt-1">Badges Unlocked</p>
          </Card>
          <Card className="p-5 text-center">
            <UserIcon className="mx-auto text-primary mb-2" size={24} />
            <p className="font-display text-2xl font-bold text-white">{data.stats.totalSimulations}</p>
            <p className="text-xs text-text-muted mt-1">Tests Received</p>
          </Card>
        </div>

        {/* Badge Showcase & Activity Feed Split */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Badges Grid (1 col on lg) */}
          <Card className="p-6 lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">Badges & Achievements</h2>
              <span className="text-xs text-text-muted">{data.badges.filter((b) => b.earned).length} of {data.badges.length}</span>
            </div>

            <div className="space-y-3">
              {data.badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3.5 transition-all ${
                    b.earned
                      ? "bg-surface-hover/80 border-primary/40 shadow-sm"
                      : "bg-surface/30 border-border/40 opacity-50 grayscale"
                  }`}
                >
                  <div className="text-2xl p-2 rounded-xl bg-background border border-border/50 shrink-0">
                    {b.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white truncate">{b.name}</p>
                      {b.earned && <CheckCircle2 size={15} className="text-accent shrink-0" />}
                    </div>
                    <p className="text-xs text-text-muted line-clamp-1">{b.description}</p>
                    {b.earnedAt && (
                      <p className="text-[10px] text-primary-glow mt-1">Earned {formatDate(b.earnedAt)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity Timeline (2 cols on lg) */}
          <Card className="p-6 lg:col-span-2 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">Activity Timeline</h2>

            {data.timeline.length === 0 ? (
              <p className="text-sm text-text-muted py-12 text-center">No activity recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {data.timeline.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-4">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center ${
                        item.status === "success"
                          ? "border-accent text-accent"
                          : item.status === "danger"
                          ? "border-danger text-danger"
                          : "border-warning text-warning"
                      }`}
                    />

                    <div className="min-w-0 flex-1 bg-surface-hover/40 border border-border/50 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-white truncate">{item.title}</p>
                        <span className="text-[11px] text-text-muted shrink-0">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

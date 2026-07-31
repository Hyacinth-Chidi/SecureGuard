"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, Badge } from "@/components/ui/Primitives";
import { LoadingBlock } from "@/components/dashboard/States";
import { formatDate } from "@/lib/utils";

interface Student {
  _id: string;
  name: string;
  email: string;
  department: string;
  joinedAt: string;
  completedCourses: number;
  resilienceScore: number;
  totalSimulations: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => setStudents(d.students));
  }, []);

  return (
    <div>
      <PageHeader title="Students" description="View resilience scores and training completions." />

      <div className="p-4 md:p-8 space-y-6">
        <Card className="overflow-x-auto">
          {!students ? (
            <LoadingBlock />
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-border-dim bg-background/50">
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Student</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Department</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Completed Trainings</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Simulations</th>
                  <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Resilience Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dim">
                {students.map((student) => {
                  let tone: "success" | "low" | "medium" | "high" = "high";
                  if (student.resilienceScore >= 850) tone = "success";
                  else if (student.resilienceScore >= 600) tone = "low";
                  else if (student.resilienceScore >= 300) tone = "medium";

                  return (
                    <tr key={student._id} className="hover:bg-background-muted/50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-text-main">{student.name}</p>
                        <p className="text-xs text-text-muted">{student.email}</p>
                      </td>
                      <td className="p-4 text-sm text-text-muted">{student.department || "—"}</td>
                      <td className="p-4 text-sm text-text-muted">{formatDate(student.joinedAt)}</td>
                      <td className="p-4 text-sm font-semibold text-text-main">{student.completedCourses}</td>
                      <td className="p-4 text-sm font-semibold text-text-main">{student.totalSimulations}</td>
                      <td className="p-4">
                        <Badge tone={tone}>{student.resilienceScore}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-text-muted">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TrainingForm, TrainingFormValues } from "@/components/dashboard/TrainingForm";
import { LoadingBlock } from "@/components/dashboard/States";

export default function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [module_, setModule] = useState<TrainingFormValues | null>(null);

  useEffect(() => {
    fetch(`/api/training/${id}`)
      .then((r) => r.json())
      .then((d) => setModule(d.module));
  }, [id]);

  return (
    <div>
      <PageHeader title="Edit training module" />
      <div className="p-4 md:p-8">{module_ ? <TrainingForm initial={module_} moduleId={id} /> : <LoadingBlock />}</div>
    </div>
  );
}

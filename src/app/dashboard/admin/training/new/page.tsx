import { PageHeader } from "@/components/dashboard/PageHeader";
import { TrainingForm } from "@/components/dashboard/TrainingForm";

export default function NewTrainingPage() {
  return (
    <div>
      <PageHeader title="New training module" description="Write a lesson and an optional quiz to check understanding." />
      <div className="p-8">
        <TrainingForm />
      </div>
    </div>
  );
}

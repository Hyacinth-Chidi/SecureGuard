import { PageHeader } from "@/components/dashboard/PageHeader";
import { TemplateForm } from "@/components/dashboard/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div>
      <PageHeader title="New template" description="Build a phishing email and its teachable-moment landing page." />
      <div className="p-8">
        <TemplateForm />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, use } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TemplateForm, TemplateFormValues } from "@/components/dashboard/TemplateForm";
import { LoadingBlock } from "@/components/dashboard/States";

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [template, setTemplate] = useState<TemplateFormValues | null>(null);

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((d) => setTemplate(d.template));
  }, [id]);

  return (
    <div>
      <PageHeader title="Edit template" description="Update this phishing email template." />
      <div className="p-8">{template ? <TemplateForm initial={template} templateId={id} /> : <LoadingBlock />}</div>
    </div>
  );
}

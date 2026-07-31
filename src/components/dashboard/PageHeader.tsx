import { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-8 pt-10 pb-8 border-b border-border/50 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-sm font-medium text-text-muted mt-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}

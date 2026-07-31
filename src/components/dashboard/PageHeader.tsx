import { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 md:px-8 py-6 border-b border-border/50 bg-background/50">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-sm font-medium text-text-muted mt-1.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

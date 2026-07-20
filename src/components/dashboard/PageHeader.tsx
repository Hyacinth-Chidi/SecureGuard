import { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-line bg-surface">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-dark">{title}</h1>
        {description && <p className="text-sm text-slate mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}

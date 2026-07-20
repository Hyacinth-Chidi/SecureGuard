import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center mb-4">
        <Inbox className="text-slate" size={20} />
      </div>
      <h3 className="font-display font-semibold text-slate-dark">{title}</h3>
      {description && <p className="text-sm text-slate mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

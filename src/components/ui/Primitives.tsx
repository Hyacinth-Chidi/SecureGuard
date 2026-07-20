import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface border border-line rounded-xl shadow-[0_1px_2px_rgba(15,52,87,0.04)]", className)}
      {...props}
    />
  );
}

type BadgeTone = "low" | "medium" | "high" | "neutral" | "info" | "success";

const badgeTones: Record<BadgeTone, string> = {
  low: "bg-teal/10 text-teal border-teal/20",
  medium: "bg-amber/10 text-amber border-amber/20",
  high: "bg-coral/10 text-coral border-coral/20",
  neutral: "bg-mist text-slate border-line",
  info: "bg-navy/10 text-navy border-navy/20",
  success: "bg-teal-bright/10 text-teal border-teal-bright/30",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border",
        badgeTones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  tone?: "navy" | "teal" | "coral" | "amber";
}) {
  const toneColor = {
    navy: "text-navy bg-navy/10",
    teal: "text-teal bg-teal/10",
    coral: "text-coral bg-coral/10",
    amber: "text-amber bg-amber/10",
  }[tone];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
          <p className="font-display text-3xl font-semibold text-slate-dark mt-2">{value}</p>
          {sublabel && <p className="text-xs text-slate mt-1">{sublabel}</p>}
        </div>
        {icon && <div className={cn("p-2.5 rounded-lg", toneColor)}>{icon}</div>}
      </div>
    </Card>
  );
}

import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass-panel rounded-2xl shadow-lg shadow-black/20", className)}
      {...props}
    />
  );
}

type BadgeTone = "low" | "medium" | "high" | "neutral" | "info" | "success";

const badgeTones: Record<BadgeTone, string> = {
  low: "bg-primary/10 text-primary border-primary/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  high: "bg-danger/10 text-danger border-danger/20",
  neutral: "bg-surface-hover text-text-muted border-border",
  info: "bg-primary/10 text-primary-glow border-primary/30",
  success: "bg-accent/10 text-accent border-accent/30",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full border",
        badgeTones[tone],
        className
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
  tone = "primary",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  tone?: "primary" | "accent" | "danger" | "warning";
}) {
  const toneColor = {
    primary: "text-primary bg-primary/10 border border-primary/20",
    accent: "text-accent bg-accent/10 border border-accent/20",
    danger: "text-danger bg-danger/10 border border-danger/20",
    warning: "text-warning bg-warning/10 border border-warning/20",
  }[tone];

  return (
    <Card className="p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-text-muted">{label}</p>
          <p className="font-display text-4xl font-bold text-text-main mt-2">{value}</p>
          {sublabel && <p className="text-sm text-text-muted mt-2">{sublabel}</p>}
        </div>
        {icon && <div className={cn("p-3 rounded-xl shadow-inner", toneColor)}>{icon}</div>}
      </div>
    </Card>
  );
}

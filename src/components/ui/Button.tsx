import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-glow shadow-md shadow-primary/20 hover:shadow-primary/40",
  secondary: "bg-surface-hover text-text-main border border-border hover:bg-border",
  ghost: "bg-transparent text-text-muted hover:text-text-main hover:bg-surface-hover",
  danger: "bg-danger text-white hover:brightness-110 shadow-md shadow-danger/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 rounded-lg gap-2",
  md: "text-base px-6 py-3 rounded-xl gap-2",
  lg: "text-lg px-8 py-4 rounded-2xl gap-3 font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

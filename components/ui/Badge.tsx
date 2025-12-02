import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function Badge({
  children,
  className,
  variant = "default",
}: BadgeProps): React.ReactElement {
  const variants = {
    default: "bg-navy-700 text-gray-300 border-navy-600",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-bleed-500/10 text-bleed-400 border-bleed-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

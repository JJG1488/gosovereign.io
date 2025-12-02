import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "dark" | "bleed";
  hover?: boolean;
}

export function Card({
  children,
  className,
  variant = "default",
  hover = false,
}: CardProps): React.ReactElement {
  const variants = {
    default: "bg-navy-800 border-navy-700",
    highlighted:
      "bg-navy-800 border-emerald-500/50 ring-1 ring-emerald-500/20",
    dark: "bg-navy-900 border-navy-800",
    bleed: "bg-navy-800 border-bleed-500/50 ring-1 ring-bleed-500/20",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 md:p-8 transition-all duration-300",
        variants[variant],
        hover &&
          "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  size = "xl",
}: ContainerProps): React.ReactElement {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-12 lg:px-16",
        containerSizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}

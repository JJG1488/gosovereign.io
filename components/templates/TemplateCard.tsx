"use client";

import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoreTemplate = "goods" | "services" | "brochure";

interface TemplateCardProps {
  id: StoreTemplate;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  onClick: (template: StoreTemplate) => void;
  highlighted?: boolean;
  disabled?: boolean;
}

export function TemplateCard({
  id,
  title,
  description,
  icon: Icon,
  features,
  onClick,
  highlighted = false,
  disabled = false,
}: TemplateCardProps): React.ReactElement {
  return (
    <button
      onClick={() => !disabled && onClick(id)}
      disabled={disabled}
      className={cn(
        "relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-navy-900",
        "group w-full",
        disabled
          ? "opacity-60 cursor-not-allowed bg-navy-800/50 border-navy-700/50"
          : cn(
              "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer",
              highlighted
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-navy-800 border-navy-700"
            )
      )}
    >
      {disabled && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
          Coming Soon
        </span>
      )}
      {!disabled && highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-navy-900 text-xs font-semibold rounded-full">
          Most Popular
        </span>
      )}

      <div
        className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
          highlighted ? "bg-emerald-500/20" : "bg-navy-700"
        )}
      >
        <Icon
          className={cn(
            "w-7 h-7",
            highlighted ? "text-emerald-400" : "text-gray-400"
          )}
        />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-emerald-400 mt-0.5">-</span>
            {feature}
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          disabled
            ? "text-gray-500"
            : highlighted
            ? "text-emerald-400"
            : "text-gray-400 group-hover:text-emerald-400"
        )}
      >
        {disabled ? "Coming soon" : "Select this template"}
        {!disabled && (
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        )}
      </div>
    </button>
  );
}

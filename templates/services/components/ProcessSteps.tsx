import Link from "next/link";
import { ClipboardList, MessageSquare, CheckCircle, ChevronRight } from "lucide-react";
import type { RuntimeSettings, ProcessStep } from "@/lib/settings";

interface ProcessStepsProps {
  settings: RuntimeSettings;
}

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  clipboard: ClipboardList,
  "clipboard-list": ClipboardList,
  message: MessageSquare,
  "message-square": MessageSquare,
  check: CheckCircle,
  "check-circle": CheckCircle,
};

function getIcon(iconName: string | undefined): React.ComponentType<{ className?: string }> {
  if (!iconName) return ClipboardList;
  return iconMap[iconName.toLowerCase()] || ClipboardList;
}

export function ProcessSteps({ settings }: ProcessStepsProps) {
  const steps = settings.process;

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-brand font-semibold text-sm uppercase tracking-wider mb-3">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {settings.processTitle}
          </h2>
          {settings.processSubtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {settings.processSubtitle}
            </p>
          )}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step: ProcessStep, index: number) => {
            const Icon = getIcon(step.icon);
            return (
              <div key={index} className="relative">
                {/* Connector Arrow (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 z-10">
                    <ChevronRight className="w-8 h-8 text-brand" />
                  </div>
                )}

                {/* Card */}
                <div
                  className={"bg-white rounded-2xl p-8 shadow-lg border-b-4 border-brand card-hover text-center stagger-" + (index + 1)}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-brand rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6 mt-4">
                    <Icon className="w-8 h-8 text-brand" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        {settings.processCTAText && (
          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-brand text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-brand-dark transition-all btn-glow text-lg"
            >
              {settings.processCTAText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

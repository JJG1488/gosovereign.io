"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/types/store";
import { useWizard } from "./WizardContext";

export function WizardProgress() {
  const { state, completedSteps, goToStep } = useWizard();

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative mb-8">
        {/* Background track */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-navy-700" />

        {/* Completed track */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500"
          style={{
            width: `${((state.currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100}%`,
          }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {WIZARD_STEPS.map((step) => {
            const isActive = state.currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            const isPast = step.id < state.currentStep;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex flex-col items-center group",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 rounded-lg"
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isActive && "bg-emerald-500 text-white scale-110",
                    isCompleted && !isActive && "bg-emerald-500/20 text-emerald-400",
                    !isActive && !isCompleted && "bg-navy-700 text-gray-500"
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Label - hidden on mobile, visible on larger screens */}
                <span
                  className={cn(
                    "hidden md:block mt-2 text-xs font-medium transition-colors max-w-[80px] text-center",
                    isActive && "text-emerald-400",
                    isPast && "text-gray-400",
                    !isActive && !isPast && "text-gray-600"
                  )}
                >
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current step info - mobile only */}
      <div className="md:hidden text-center mb-6">
        <p className="text-sm text-gray-400">
          Step {state.currentStep} of {WIZARD_STEPS.length}
        </p>
        <p className="text-lg font-medium text-white">
          {WIZARD_STEPS[state.currentStep - 1]?.name}
        </p>
      </div>
    </div>
  );
}

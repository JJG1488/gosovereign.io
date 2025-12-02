"use client";

import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizard } from "./WizardContext";

interface WizardNavigationProps {
  onGenerate?: () => void;
}

export function WizardNavigation({ onGenerate }: WizardNavigationProps) {
  const {
    state,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
  } = useWizard();

  const handleNext = () => {
    if (isLastStep && onGenerate) {
      onGenerate();
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex items-center justify-between pt-8 border-t border-navy-700">
      {/* Previous button */}
      <Button
        variant="ghost"
        onClick={prevStep}
        disabled={!canGoPrev || state.isSubmitting}
        className="text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Next / Generate button */}
      <Button
        onClick={handleNext}
        disabled={(!canGoNext && !isLastStep) || state.isSubmitting}
        className={isLastStep ? "bg-emerald-500 hover:bg-emerald-600" : ""}
      >
        {state.isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {isLastStep ? "Generating..." : "Saving..."}
          </>
        ) : isLastStep ? (
          <>
            Generate Store
            <Sparkles className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}

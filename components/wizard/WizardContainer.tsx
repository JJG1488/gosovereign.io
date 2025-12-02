"use client";

import { useWizard } from "./WizardContext";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { StoreNameStep } from "./steps/StoreNameStep";
import { TaglineStep } from "./steps/TaglineStep";
import { ColorStep } from "./steps/ColorStep";
import { LogoStep } from "./steps/LogoStep";
import { ProductsStep } from "./steps/ProductsStep";
import { AboutStep } from "./steps/AboutStep";
import { ContactStep } from "./steps/ContactStep";
import { PaymentsStep } from "./steps/PaymentsStep";

interface WizardContainerProps {
  onGenerate: () => void;
}

export function WizardContainer({ onGenerate }: WizardContainerProps) {
  const { state } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <StoreNameStep />;
      case 2:
        return <TaglineStep />;
      case 3:
        return <ColorStep />;
      case 4:
        return <LogoStep />;
      case 5:
        return <ProductsStep />;
      case 6:
        return <AboutStep />;
      case 7:
        return <ContactStep />;
      case 8:
        return <PaymentsStep />;
      default:
        return <StoreNameStep />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <WizardProgress />

      {/* Step content */}
      <div className="bg-navy-800 rounded-2xl p-6 md:p-8 min-h-[400px]">
        {/* Error message */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {/* Current step */}
        <div className="mb-8">{renderStep()}</div>

        {/* Navigation */}
        <WizardNavigation onGenerate={onGenerate} />
      </div>
    </div>
  );
}

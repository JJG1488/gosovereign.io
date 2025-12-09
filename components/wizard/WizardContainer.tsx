"use client";

import { useWizard } from "./WizardContext";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { StoreNameStep } from "./steps/StoreNameStep";
import { TaglineStep } from "./steps/TaglineStep";
import { ColorStep } from "./steps/ColorStep";
import { LogoStep } from "./steps/LogoStep";
import { ProductsStep } from "./steps/ProductsStep";
import { ServicesStep } from "./steps/ServicesStep";
import { PortfolioStep } from "./steps/PortfolioStep";
import { TestimonialsStep } from "./steps/TestimonialsStep";
import { AboutStep } from "./steps/AboutStep";
import { ContactStep } from "./steps/ContactStep";
import { PaymentsStep } from "./steps/PaymentsStep";

interface WizardContainerProps {
  onGenerate: () => void;
}

export function WizardContainer({ onGenerate }: WizardContainerProps) {
  const { currentStepKey, state } = useWizard();

  // Render step based on step key (not step number)
  const renderStep = () => {
    switch (currentStepKey) {
      case "storeName":
        return <StoreNameStep />;
      case "tagline":
        return <TaglineStep />;
      case "primaryColor":
        return <ColorStep />;
      case "logo":
        return <LogoStep />;
      case "products":
        return <ProductsStep />;
      case "services":
        return <ServicesStep />;
      case "portfolio":
        return <PortfolioStep />;
      case "testimonials":
        return <TestimonialsStep />;
      case "about":
        return <AboutStep />;
      case "contact":
        return <ContactStep />;
      case "payments":
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

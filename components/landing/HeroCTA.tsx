"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { redirectToCheckout } from "@/lib/checkout";

interface HeroCTAProps {
  cta: string;
  variant?: string;
}

export function HeroCTA({ cta, variant }: HeroCTAProps): React.ReactElement {
  const handleClick = (): void => {
    // Default to starter plan from hero CTA
    redirectToCheckout("starter", variant);
  };

  return (
    <Button
      size="lg"
      className="text-lg px-10 py-5 group"
      onClick={handleClick}
    >
      {cta}
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}

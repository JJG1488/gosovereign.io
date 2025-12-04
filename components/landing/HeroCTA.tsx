"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

interface HeroCTAProps {
  cta: string;
  variant?: string;
}

export function HeroCTA({ cta }: HeroCTAProps): React.ReactElement {
  const router = useRouter();

  const handleClick = (): void => {
    // Primary CTA goes to free trial signup
    router.push("/auth/signup");
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

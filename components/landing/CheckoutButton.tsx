"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { redirectToCheckout, type PlanType } from "@/lib/checkout";

interface CheckoutButtonProps {
  plan: PlanType;
  variant?: string;
  children: React.ReactNode;
  buttonVariant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CheckoutButton({
  plan,
  variant,
  children,
  buttonVariant = "primary",
  size = "lg",
  className,
}: CheckoutButtonProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await redirectToCheckout(plan, variant);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={buttonVariant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>
      {error && (
        <p className="absolute top-full left-0 right-0 text-center text-red-400 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

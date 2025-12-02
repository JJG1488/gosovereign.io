"use client";

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
  const handleClick = (): void => {
    redirectToCheckout(plan, variant);
  };

  return (
    <Button
      variant={buttonVariant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}

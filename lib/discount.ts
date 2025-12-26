// Discount configuration for $50 Starter tier promotion (10 days from Dec 25, 2024)
export const DISCOUNT_DEADLINE = new Date("2025-01-04T00:00:00Z");
export const DISCOUNT_PRICE = 5000; // $50 in cents
export const NORMAL_STARTER_PRICE = 14900; // $149 in cents

export function isDiscountActive(): boolean {
  return Date.now() < DISCOUNT_DEADLINE.getTime();
}

export function getStarterPrice(): number {
  return isDiscountActive() ? DISCOUNT_PRICE : NORMAL_STARTER_PRICE;
}

export function getStarterPriceDisplay(): string {
  const price = getStarterPrice();
  return `$${(price / 100).toFixed(0)}`;
}

export function getDiscountDaysRemaining(): number {
  const diff = DISCOUNT_DEADLINE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getDiscountSavings(): number {
  return NORMAL_STARTER_PRICE - DISCOUNT_PRICE; // $99 savings
}

export function getDiscountSavingsDisplay(): string {
  const savings = getDiscountSavings();
  return `$${(savings / 100).toFixed(0)}`;
}

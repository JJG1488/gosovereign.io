/**
 * BOGO (Buy One Get One) promotion utilities.
 * Offer: Users can create up to 2 stores until February 1, 2026.
 */

export const BOGO_DEADLINE = new Date("2026-02-01T00:00:00Z");

/**
 * Check if we're still within the BOGO promotion period.
 */
export function isBogoPeriod(): boolean {
  return Date.now() < BOGO_DEADLINE.getTime();
}

/**
 * Get the maximum number of stores a user can create.
 * During BOGO: 2 stores. After: 1 store.
 */
export function getMaxStores(): number {
  return isBogoPeriod() ? 2 : 1;
}

/**
 * Get the number of days remaining until BOGO expires.
 */
export function getDaysRemaining(): number {
  const now = Date.now();
  const deadline = BOGO_DEADLINE.getTime();
  if (now >= deadline) return 0;
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
}

/**
 * Format the countdown in a human-readable way.
 * Examples: "403 days left", "1 month left", "Offer expired"
 */
export function formatCountdown(): string {
  const days = getDaysRemaining();
  if (days === 0) return "Offer expired";
  if (days === 1) return "1 day left";
  if (days <= 30) return `${days} days left`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} left`;
}

/**
 * Format the countdown in a short form for badges.
 * Examples: "403d", "1d", "expired"
 */
export function formatCountdownShort(): string {
  const days = getDaysRemaining();
  if (days === 0) return "expired";
  return `${days}d`;
}

/**
 * Get the formatted deadline date.
 */
export function getDeadlineFormatted(): string {
  return BOGO_DEADLINE.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

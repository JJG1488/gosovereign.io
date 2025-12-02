import { redirect } from "next/navigation";

// A/B Test Router
// Randomly redirects visitors to either Variant A or Variant B
// For production, you'd want server-side random with cookies to ensure consistency

export default function HomePage(): never {
  // Simple 50/50 split based on random
  // In production, use a proper A/B testing solution with persistent assignment
  const variant = Math.random() < 0.5 ? "a" : "b";
  redirect(`/${variant}`);
}

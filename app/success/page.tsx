"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Container, Button } from "@/components/ui";

interface SessionInfo {
  email: string;
  plan: string;
  amount: number;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(!!sessionId);

  useEffect(() => {
    async function fetchSessionInfo() {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setSessionInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch session info:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessionInfo();
  }, [sessionId]);

  const planName = sessionInfo?.plan
    ? sessionInfo.plan.charAt(0).toUpperCase() + sessionInfo.plan.slice(1)
    : "GoSovereign";

  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center py-20">
      <Container size="sm">
        <div className="text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mb-8">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            You own this.
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
            Not &quot;subscribe to&quot; — <span className="text-emerald-400 font-semibold">own</span>.
            Big difference. Welcome to GoSovereign.
          </p>

          {/* Plan info */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-8">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading your purchase details...
            </div>
          ) : sessionInfo ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{planName}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Confirmation sent to <span className="text-white font-medium">{sessionInfo.email}</span>
              </p>
              <p className="text-amber-400 text-xs mt-2">
                Didn&apos;t receive it? Check your spam folder or promotions tab.
              </p>
            </div>
          ) : null}

          {/* What happens next */}
          <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              What happens next
            </h2>
            <ol className="space-y-3 text-gray-400">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  1
                </span>
                <span>
                  <strong className="text-white">Click the button below</strong> to enter the store builder
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  2
                </span>
                <span>Answer 8 simple questions to configure your store</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  3
                </span>
                <span>Connect your Stripe account to accept payments</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  4
                </span>
                <span>Download your complete, ready-to-deploy store</span>
              </li>
            </ol>
          </div>

          {/* Primary CTA */}
          <Link href="/wizard">
            <Button variant="primary" size="lg">
              Build Your Store Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>

          <p className="text-gray-500 text-sm mt-6 mb-4">
            Questions? Reply to your confirmation email. Real human on the other end.
          </p>

          <Link href="/">
            <Button variant="secondary" size="sm">
              Back to Home
            </Button>
          </Link>

          {/* Signature */}
          <p className="mt-12 text-gray-600 text-sm">
            Welcome to the ownership economy.
            <br />
            — Dr. G, Founder
          </p>
        </div>
      </Container>
    </main>
  );
}

export default function SuccessPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-navy-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

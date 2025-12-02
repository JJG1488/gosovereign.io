import { CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Container, Button } from "@/components/ui";

export const metadata = {
  title: "Welcome to GoSovereign — You Own This",
  description: "Your purchase is complete. Welcome to the ownership economy.",
};

export default function SuccessPage(): React.ReactElement {
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
            Not "subscribe to" — <span className="text-emerald-400 font-semibold">own</span>.
            Big difference. Welcome to GoSovereign.
          </p>

          {/* What happens next */}
          <div className="bg-navy-800 rounded-2xl p-8 border border-navy-700 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-400" />
              What happens next
            </h2>
            <ol className="space-y-3 text-gray-400">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  1
                </span>
                <span>Check your email for access instructions</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  2
                </span>
                <span>Pick your template</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  3
                </span>
                <span>Answer 15 questions</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center justify-center">
                  4
                </span>
                <span>Launch your store</span>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <p className="text-gray-500 text-sm mb-4">
            Questions? Reply to your confirmation email. Real human on the other end.
          </p>

          <a href="/">
            <Button variant="secondary" size="lg">
              Back to Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </a>

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

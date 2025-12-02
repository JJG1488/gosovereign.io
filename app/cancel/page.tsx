import { ArrowLeft, HelpCircle } from "lucide-react";
import { Container, Button } from "@/components/ui";

export const metadata = {
  title: "GoSovereign — No Pressure",
  description: "Take your time. Your store will be here when you're ready.",
};

export default function CancelPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center py-20">
      <Container size="sm">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy-800 border border-navy-700 mb-8">
            <HelpCircle className="w-10 h-10 text-gray-400" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            No pressure.
          </h1>

          <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
            Changed your mind? That's okay. Your store will be here when you're ready.
          </p>

          {/* Reminder */}
          <div className="bg-navy-800/50 rounded-xl p-6 border border-navy-700 mb-8 max-w-md mx-auto">
            <p className="text-gray-400 text-sm">
              Remember: Every month you wait, Shopify collects another $39+ from entrepreneurs like you.
            </p>
            <p className="text-emerald-400 font-semibold mt-2">
              GoSovereign is $149. Once. Forever.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/">
              <Button variant="primary" size="lg">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Try Again
              </Button>
            </a>
          </div>

          {/* FAQ link */}
          <p className="mt-8 text-gray-600 text-sm">
            Have questions?{" "}
            <a href="/#faq" className="text-emerald-400 hover:underline">
              Check our FAQ
            </a>
          </p>
        </div>
      </Container>
    </main>
  );
}

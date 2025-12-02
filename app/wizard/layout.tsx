import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Store | GoSovereign",
  description:
    "Answer 8 simple questions and get a fully-functional e-commerce store you own forever.",
};

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="border-b border-navy-700 bg-navy-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-white">
            GoSovereign
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:block">
              Building your store
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-navy-700 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            Your progress is saved automatically.{" "}
            <a href="/faq" className="text-emerald-400 hover:underline">
              Need help?
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

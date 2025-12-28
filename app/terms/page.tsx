import { variantA } from "@/content/copy";
import { termsOfService } from "@/content/legal";
import { Navigation, Footer } from "@/components/landing";
import { Container } from "@/components/ui";

export const metadata = {
  title: "Terms of Service - GoSovereign",
  description:
    "Terms of Service for GoSovereign e-commerce platform. Read our terms and conditions for using our services.",
  openGraph: {
    title: "Terms of Service - GoSovereign",
    description: "Terms of Service for GoSovereign e-commerce platform.",
    url: "https://gosovereign.io/terms",
    siteName: "GoSovereign",
    type: "website",
  },
};

export default function TermsPage() {
  const copy = variantA;

  return (
    <>
      <Navigation logo={copy.nav.logo} cta={copy.nav.cta} />
      <main className="pt-24 md:pt-32 min-h-screen bg-navy-900">
        <Container size="md">
          <div className="py-12 md:py-16">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
                {termsOfService.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span>Effective: {termsOfService.effectiveDate}</span>
                <span>Last Updated: {termsOfService.lastUpdated}</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              {termsOfService.sections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-100 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-12 pt-8 border-t border-navy-700">
              <p className="text-gray-400">
                Questions about these terms?{" "}
                <a
                  href="mailto:info@gosovereign.io"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer
        logo={copy.footer.logo}
        links={copy.footer.links}
        copyright={copy.footer.copyright}
      />
    </>
  );
}

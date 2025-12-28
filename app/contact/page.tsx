import { variantA } from "@/content/copy";
import { Navigation, Footer } from "@/components/landing";
import { Container } from "@/components/ui";
import { ContactForm } from "@/components/contact/ContactForm";
import { Mail, MessageCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us - GoSovereign",
  description:
    "Get in touch with the GoSovereign team. We're here to help with your e-commerce questions.",
  openGraph: {
    title: "Contact Us - GoSovereign",
    description: "Get in touch with the GoSovereign team.",
    url: "https://gosovereign.io/contact",
    siteName: "GoSovereign",
    type: "website",
  },
};

export default function ContactPage() {
  const copy = variantA;

  return (
    <>
      <Navigation logo={copy.nav.logo} cta={copy.nav.cta} />
      <main className="pt-24 md:pt-32 min-h-screen bg-navy-900">
        <Container size="md">
          <div className="py-12 md:py-16">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Have a question about GoSovereign? We&apos;re here to help.
                Fill out the form below and we&apos;ll get back to you as soon
                as possible.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">Email</h3>
                <a
                  href="mailto:support@gosovereign.io"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  support@gosovereign.io
                </a>
              </div>

              <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">
                  Response Time
                </h3>
                <p className="text-gray-400">Usually within 24 hours</p>
              </div>

              <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">
                  Quick Answers
                </h3>
                <a
                  href="/faq"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Check our FAQ
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-6 md:p-8">
              <ContactForm />
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

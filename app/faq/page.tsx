import { variantA } from "@/content/copy";
import { Navigation, Footer, FAQ } from "@/components/landing";

export const metadata = {
  title: "FAQ - GoSovereign",
  description:
    "Frequently asked questions about GoSovereign - your one-time payment e-commerce platform. Learn about pricing, features, and how to get started.",
  openGraph: {
    title: "FAQ - GoSovereign",
    description:
      "Frequently asked questions about GoSovereign - your one-time payment e-commerce platform.",
    url: "https://gosovereign.io/faq",
    siteName: "GoSovereign",
    type: "website",
  },
};

export default function FAQPage() {
  const copy = variantA;

  return (
    <>
      <Navigation logo={copy.nav.logo} cta={copy.nav.cta} />
      <main className="pt-24 min-h-screen bg-navy-900">
        <FAQ headline={copy.faq.headline} items={copy.faq.items} />
      </main>
      <Footer
        logo={copy.footer.logo}
        links={copy.footer.links}
        copyright={copy.footer.copyright}
      />
    </>
  );
}

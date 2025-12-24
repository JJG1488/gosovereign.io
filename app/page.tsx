import { variantA } from "@/content/copy";
import {
  Navigation,
  Hero,
  ProblemSection,
  SolutionSection,
  HowItWorks,
  Pricing,
  WhoItsFor,
  FAQ,
  FinalCTA,
  Footer,
  BogoPromo,
} from "@/components/landing";

export const metadata = {
  title: "GoSovereign — Shopify costs $468/year. Your store shouldn't.",
  description:
    "Launch a beautiful, fully-owned e-commerce store in 15 minutes. One price. No subscriptions. No code. No permission needed.",
};

export default function HomePage(): React.ReactElement {
  const copy = variantA;

  return (
    <>
      <Navigation logo={copy.nav.logo} cta={copy.nav.cta} />
      <BogoPromo />

      <main>
        <Hero
          headline={copy.hero.headline}
          subheadline={copy.hero.subheadline}
          cta={copy.hero.cta}
          microProof={copy.hero.microProof}
        />

        <ProblemSection
          headline={copy.problem.headline}
          intro={copy.problem.intro}
          cards={copy.problem.cards}
          total={copy.problem.total}
          kicker={copy.problem.kicker}
        />

        <SolutionSection
          headline={copy.solution.headline}
          intro={copy.solution.intro}
          features={copy.solution.features}
        />

        <HowItWorks
          headline={copy.howItWorks.headline}
          steps={copy.howItWorks.steps}
        />

        <Pricing
          headline={copy.pricing.headline}
          anchor={copy.pricing.anchor}
          plans={copy.pricing.plans}
        />

        <WhoItsFor
          headline={copy.whoItsFor.headline}
          checklist={copy.whoItsFor.checklist}
          closing={copy.whoItsFor.closing}
        />

        <FAQ headline={copy.faq.headline} items={copy.faq.items} />

        <FinalCTA
          headline={copy.finalCta.headline}
          subheadline={copy.finalCta.subheadline}
          cta={copy.finalCta.cta}
          guarantee={copy.finalCta.guarantee}
        />
      </main>

      <Footer
        logo={copy.footer.logo}
        links={copy.footer.links}
        copyright={copy.footer.copyright}
      />
    </>
  );
}

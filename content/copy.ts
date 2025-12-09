// GoSovereign Copy - All Variants
// Source of truth for all landing page copy

export interface CopyVariant {
  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    microProof: string;
  };
  problem: {
    headline: string;
    intro: string;
    cards: Array<{
      title: string;
      cost: string;
      subtext: string;
    }>;
    total: {
      after: string;
      own: string;
    };
    kicker: string[];
  };
  solution: {
    headline: string;
    intro: string;
    features: Array<{
      title: string;
      description: string;
    }>;
  };
  howItWorks: {
    headline: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
    }>;
  };
  pricing: {
    headline: string;
    anchor: string;
    plans: Array<{
      name: string;
      price: string;
      priceNote: string;
      features: string[];
      cta: string;
      highlighted?: boolean;
      badge?: string;
    }>;
  };
  whoItsFor: {
    headline: string;
    checklist: string[];
    closing: string;
  };
  faq: {
    headline: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  finalCta: {
    headline: string;
    subheadline: string;
    cta: string;
    guarantee: string;
  };
  nav: {
    logo: string;
    cta: string;
  };
  footer: {
    logo: string;
    links: string[];
    copyright: string;
  };
}

// VARIANT A — Price-Forward
export const variantA: CopyVariant = {
  hero: {
    headline: "Shopify costs $468/year. Your store shouldn't.",
    subheadline:
      "Launch a beautiful, fully-owned e-commerce store in 15 minutes. One price. No subscriptions. No code. No permission needed.",
    cta: "Try it Now",
    microProof:
      '"Replaced my $39/month Shopify store in an afternoon." — Early adopter',
  },
  problem: {
    headline: "The subscription trap is bleeding you dry",
    intro: 'Here\'s what "just $39/month" actually costs you:',
    cards: [
      { title: "Basic Plan", cost: "$468/year", subtext: "Just to exist" },
      {
        title: "Transaction Fees",
        cost: "2.9% + 30¢",
        subtext: "On every single sale",
      },
      {
        title: '"Essential" Apps',
        cost: "$600–2,400/year",
        subtext: "Reviews, email, SEO, upsells...",
      },
    ],
    total: {
      after: "After 3 years: $2,000 – $5,000 paid.",
      own: "Amount you own: $0.",
    },
    kicker: [
      "Cancel your subscription tomorrow. Your store disappears. Your products vanish. Your customers can't find you.",
      "That's not ownership. That's a hostage situation.",
    ],
  },
  solution: {
    headline: "One purchase. Your store. Forever.",
    intro: "Everything you need. Nothing you don't.",
    features: [
      {
        title: "Niche-Ready Templates",
        description:
          "Fashion, services, digital products. Designed to convert, not just look pretty.",
      },
      {
        title: "15-Minute Setup Wizard",
        description:
          "Answer a few questions. Watch your store build itself. No code. No frustration.",
      },
      {
        title: "Stripe Built In",
        description:
          "Accept payments instantly. 2.9% + 30¢ to Stripe—not us. We don't touch your revenue.",
      },
      {
        title: "No Code Required",
        description:
          "Drag, drop, done. If you can use Canva, you can use GoSovereign.",
      },
      {
        title: "Yours Forever",
        description:
          "Download your store. Host it anywhere. Cancel nothing because there's nothing to cancel.",
      },
    ],
  },
  howItWorks: {
    headline: "Live in 15 minutes. Seriously.",
    steps: [
      {
        number: 1,
        title: "Pick Your Template",
        description:
          "Fashion, services, or digital products. Each one built for your specific business.",
      },
      {
        number: 2,
        title: "Answer 15 Questions",
        description:
          "Brand colors, payment setup, shipping zones. Our wizard handles the rest.",
      },
      {
        number: 3,
        title: "Launch",
        description: "Preview your store. Click deploy. You're live.",
      },
    ],
  },
  pricing: {
    headline: "The last e-commerce purchase you'll make",
    anchor:
      "Shopify's cheapest plan costs $468/year. GoSovereign pays for itself in under 2 months — then it's pure profit.",
    plans: [
      {
        name: "GoSovereign",
        price: "$50",
        priceNote: "one-time",
        features: [
          "Complete e-commerce store",
          "15-minute setup wizard",
          "Stripe payments built-in",
          "Self-hosted (you control it)",
          "30-day email support",
          "Yours forever — no subscriptions",
        ],
        cta: "Get Started",
        highlighted: true,
      },
    ],
  },
  whoItsFor: {
    headline: "Built for entrepreneurs who hate subscriptions",
    checklist: [
      "You want to sell online without a computer science degree",
      "You're tired of platform fees eating your margins",
      "You believe you should own what you build",
      "You want one price, not another subscription",
      "You're ready to launch this week, not this year",
    ],
    closing: "If that's you, you're in the right place.",
  },
  faq: {
    headline: "Questions? We've got answers.",
    items: [
      {
        question: "Do I need technical skills?",
        answer:
          "If you can drag and drop, you can use GoSovereign. Our wizard handles the technical stuff. You focus on your products.",
      },
      {
        question: "What's the catch?",
        answer:
          "No catch. You pay once, you own it forever. We make money when you buy, not by bleeding you monthly. Our incentive is to make you successful so you tell your friends.",
      },
      {
        question: "Can I use my own domain?",
        answer:
          "Absolutely. Point your domain to your store in about 5 minutes. We'll show you exactly how.",
      },
      {
        question: "What about payments?",
        answer:
          "Stripe handles your payments. Their fee is 2.9% + 30¢ per transaction—industry standard. We don't take a cut of your sales. Ever.",
      },
      {
        question: "What if I don't like it?",
        answer:
          "30-day money-back guarantee. If GoSovereign isn't for you, email us and we'll refund you. No questions, no hassle.",
      },
      {
        question: "How is this different from Shopify?",
        answer:
          "Shopify charges you $39+ every month forever. We charge you once. After 4 months, we're literally cheaper. After a year, you've saved $300+. After 3 years? You've saved thousands.",
      },
    ],
  },
  finalCta: {
    headline: "Go Sovereign. Own everything.",
    subheadline:
      "Your store. Your rules. Your profit. No landlords. No monthly fees. No permission needed.",
    cta: "Try it Now",
    guarantee:
      "30-day money-back guarantee. If it's not for you, full refund. No questions.",
  },
  nav: {
    logo: "GoSovereign",
    cta: "Try it Now",
  },
  footer: {
    logo: "GoSovereign",
    links: ["FAQ", "Contact", "Terms", "Privacy"],
    copyright: "© 2024 GoSovereign. Own your store.",
  },
};


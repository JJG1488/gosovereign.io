"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Briefcase, Image, Loader2 } from "lucide-react";
import { Container } from "@/components/ui";
import { TemplateCard, type StoreTemplate } from "@/components/templates";
import { createClient } from "@/lib/supabase/client";

const TEMPLATES = [
  {
    id: "goods" as StoreTemplate,
    title: "Goods",
    description: "Sell physical products with a full e-commerce store",
    icon: ShoppingBag,
    features: [
      "Product catalog with images",
      "Shopping cart & checkout",
      "Stripe payments built-in",
      "Inventory management",
      "Shipping zones support",
    ],
    highlighted: true,
    disabled: false,
  },
  {
    id: "services" as StoreTemplate,
    title: "Services",
    description: "Offer your services with pricing and booking",
    icon: Briefcase,
    features: [
      "Service listings with pricing",
      "Contact & inquiry forms",
      "Stripe payments built-in",
      "About & testimonials",
      "No inventory complexity",
    ],
    highlighted: false,
    disabled: false,
  },
  {
    id: "brochure" as StoreTemplate,
    title: "Brochure",
    description: "Showcase your work with a portfolio site",
    icon: Image,
    features: [
      "Portfolio gallery",
      "Client testimonials",
      "About section",
      "Contact form",
      "No payment integration needed",
    ],
    highlighted: false,
    disabled: false,
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to signup with next parameter to return here
        router.push("/auth/signup?next=/templates");
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    }

    checkAuth();
  }, [router]);

  const handleTemplateSelect = (template: StoreTemplate) => {
    router.push(`/wizard?template=${template}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-navy-900 py-20">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your Template
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select the template that best fits your business. Each template is
            optimized for its specific use case.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              {...template}
              onClick={handleTemplateSelect}
            />
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          You can always create additional stores with different templates later.
        </p>
      </Container>
    </main>
  );
}

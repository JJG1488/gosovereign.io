"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, animate } from "framer-motion";
import { Check, Sparkles, Zap } from "lucide-react";
import { Container, Card, Badge, Button } from "@/components/ui";
import {
  isDiscountActive,
  getStarterPrice,
  getStarterPriceDisplay,
  getDiscountDaysRemaining,
  NORMAL_STARTER_PRICE,
} from "@/lib/discount";

interface Plan {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

interface PricingProps {
  headline: string;
  anchor: string;
  plans: Plan[];
}

// 3-year cost comparison data
const SHOPIFY_YEAR_3 = 1404;

export function Pricing({
  headline,
  anchor,
  plans,
}: PricingProps): React.ReactElement {
  const router = useRouter();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [shopifyCost, setShopifyCost] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Flash sale state
  const discountActive = isDiscountActive();
  const currentStarterPrice = getStarterPrice() / 100; // Convert cents to dollars
  const daysRemaining = getDiscountDaysRemaining();

  const handleGetStarted = () => {
    router.push("/templates");
  };

  // // Animate the cost comparison when in view
  // useEffect(() => {
  //   if (isInView && !hasAnimated) {
  //     setHasAnimated(true);
  //     const controls = animate(0, SHOPIFY_YEAR_3, {
  //       duration: 2,
  //       ease: "easeOut",
  //       onUpdate: (value) => setShopifyCost(Math.round(value)),
  //     });
  //     return () => controls.stop();
  //   }
  // }, [isInView, hasAnimated]);


  useEffect(() => {
    if (isInView && !hasAnimated) {
      const controls = animate(0, SHOPIFY_YEAR_3, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (value) => setShopifyCost(Math.round(value)),
        onComplete: () => setHasAnimated(true),
      });
      return () => controls.stop();
    }
  }, [isInView, hasAnimated]);

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-navy-900 overflow-hidden"
    >
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[800px] bg-emerald-500/5 blur-[200px] rounded-full" />

      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
            {headline}
          </h2>
        </motion.div>

        {/* 3-Year Cost Comparison - Animated Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <div className="bg-navy-800 rounded-2xl p-6 md:p-8 border border-navy-700">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-6 text-center">
              3-Year Total Cost
            </p>

            <div className="space-y-6">
              {/* Shopify Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Shopify Basic</span>
                  <span className="text-2xl font-bold text-bleed-400 tabular-nums">
                    ${shopifyCost.toLocaleString()}
                  </span>
                </div>
                <div className="h-8 bg-navy-900 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: "100%" } : {}}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-bleed-600 to-bleed-400 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  + transaction fees + app fees + theme costs...
                </p>
              </div>

              {/* GoSovereign Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">GoSovereign</span>
                  <div className="flex items-baseline gap-2">
                    {discountActive && (
                      <span className="text-lg text-gray-500 line-through">
                        ${NORMAL_STARTER_PRICE / 100}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-emerald-400">
                      ${currentStarterPrice}
                    </span>
                    {discountActive && (
                      <span className="text-sm text-amber-400 font-medium">
                        SALE
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 bg-navy-900 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={
                      isInView
                        ? {
                            width: `${
                              (currentStarterPrice / SHOPIFY_YEAR_3) * 100
                            }%`,
                          }
                        : {}
                    }
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg glow-emerald"
                  />
                </div>
                <p className="text-xs text-emerald-500 mt-1">
                  One-time. Forever.
                </p>
              </div>
            </div>

            {/* Savings callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 2.2 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  Save ${(SHOPIFY_YEAR_3 - currentStarterPrice).toLocaleString()}+
                  over 3 years
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => {
            // Check if this is the Starter plan and apply flash sale pricing
            const isStarter = plan.name === "Starter";
            const showFlashSale = isStarter && discountActive;
            const displayPrice = showFlashSale
              ? getStarterPriceDisplay()
              : plan.price;

            return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
              }}
              className={plan.highlighted ? "md:-mt-4 md:mb-4" : ""}
            >
              <Card
                variant={plan.highlighted ? "highlighted" : "default"}
                className={`h-full flex flex-col ${
                  plan.highlighted || showFlashSale ? "relative" : ""
                }`}
              >
                {/* Flash sale badge for Starter */}
                {showFlashSale && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <Zap className="w-3 h-3" />
                      FLASH SALE • {daysRemaining}d left
                    </div>
                  </div>
                )}
                {/* Regular badge for other plans */}
                {plan.badge && !showFlashSale && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="success">{plan.badge}</Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    {/* Strikethrough original price during flash sale */}
                    {showFlashSale && (
                      <span className="text-2xl text-gray-500 line-through">
                        {plan.price}
                      </span>
                    )}
                    <span
                      className={`text-4xl md:text-5xl font-bold ${
                        showFlashSale
                          ? "text-amber-400"
                          : plan.highlighted
                          ? "text-emerald-400"
                          : "text-gray-100"
                      }`}
                    >
                      {displayPrice}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{plan.priceNote}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted
                            ? "text-emerald-400"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlighted ? "primary" : "secondary"}
                  size="lg"
                  className="w-full"
                  onClick={handleGetStarted}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
            );
          })}
        </div>

        {/* Anchor line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center text-lg text-gray-400 max-w-2xl mx-auto"
        >
          {anchor}
        </motion.p>
      </Container>
    </section>
  );
}

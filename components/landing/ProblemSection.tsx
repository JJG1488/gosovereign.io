"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { DollarSign, Percent, Puzzle, AlertTriangle } from "lucide-react";
import { Container, Card } from "@/components/ui";

interface ProblemCard {
  title: string;
  cost: string;
  subtext: string;
}

interface ProblemSectionProps {
  headline: string;
  intro: string;
  cards: ProblemCard[];
  total: {
    after: string;
    own: string;
  };
  kicker: string[];
}

const icons = [DollarSign, Percent, Puzzle];

export function ProblemSection({
  headline,
  intro,
  cards,
  total,
  kicker,
}: ProblemSectionProps): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-navy-950 overflow-hidden"
    >
      {/* Danger glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-bleed-500/5 blur-[200px] rounded-full" />

      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100 mb-4">
            {headline}
          </h2>
          <p className="text-lg text-gray-400">{intro}</p>
        </motion.div>

        {/* Cost Cards - Invoice Stack Effect */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.15,
                  ease: "easeOut",
                }}
              >
                <Card variant="bleed" className="relative overflow-hidden group">
                  {/* Invoice-style header */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-bleed-600 via-bleed-500 to-bleed-600" />

                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-bleed-500/10 text-bleed-400 group-hover:bg-bleed-500/20 transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                        {card.title}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-bleed-400">
                        {card.cost}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {card.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Stamp overlay on hover */}
                  <motion.div
                    initial={{ opacity: 0, scale: 1.2, rotate: -12 }}
                    whileHover={{ opacity: 0.15, scale: 1, rotate: -12 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <span className="text-4xl font-black text-bleed-500 uppercase tracking-widest border-4 border-bleed-500 px-4 py-2">
                      PAID
                    </span>
                  </motion.div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Total Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <Card variant="bleed" className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-bleed-400" />
              <span className="text-sm text-gray-500 uppercase tracking-wider">
                The Reality
              </span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-100 mb-1">
              {total.after}
            </p>
            <p className="text-2xl md:text-3xl font-black text-bleed-400">
              {total.own}
            </p>
          </Card>
        </motion.div>

        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="max-w-3xl mx-auto text-center"
        >
          {kicker.map((line, i) => (
            <p
              key={i}
              className={`text-lg md:text-xl ${
                i === kicker.length - 1
                  ? "text-bleed-400 font-semibold mt-4"
                  : "text-gray-400"
              }`}
            >
              {line}
            </p>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

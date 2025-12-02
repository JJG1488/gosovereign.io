"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  headline: string;
  items: FAQItem[];
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
  isInView,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isInView: boolean;
}): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
      className="border-b border-navy-700 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset rounded-lg group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-gray-100 group-hover:text-emerald-400 transition-colors pr-4">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 group-hover:text-emerald-400 transition-colors flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-400 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ({ headline, items }: FAQProps): React.ReactElement {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="relative py-24 md:py-32 bg-navy-900">
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-100">
            {headline}
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto bg-navy-800/50 rounded-2xl p-6 md:p-8 border border-navy-700">
          {items.map((item, index) => (
            <FAQAccordionItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

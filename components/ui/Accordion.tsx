"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AccordionItem({
  title,
  children,
  isOpen = false,
  onToggle,
}: AccordionItemProps): React.ReactElement {
  return (
    <div className="border-b border-navy-700 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset rounded-lg group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-gray-100 group-hover:text-emerald-400 transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400 group-hover:text-emerald-400 transition-colors"
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
            <div className="pb-5 text-gray-400 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
  type?: "single" | "multiple";
  defaultOpen?: number;
}

export function Accordion({
  children,
  className,
  type = "single",
  defaultOpen,
}: AccordionProps): React.ReactElement {
  const [openItems, setOpenItems] = useState<Set<number>>(
    defaultOpen !== undefined ? new Set([defaultOpen]) : new Set()
  );

  const handleToggle = (index: number): void => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (type === "single") {
        if (newSet.has(index)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(index);
        }
      } else {
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
      }
      return newSet;
    });
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={cn("divide-y divide-navy-700", className)}>
      {items.map((child, index) => {
        if (!child) return null;
        const isOpen = openItems.has(index);
        return (
          <div key={index}>
            {typeof child === "object" && "props" in child
              ? { ...child, props: { ...child.props, isOpen, onToggle: () => handleToggle(index) } }
              : child}
          </div>
        );
      })}
    </div>
  );
}

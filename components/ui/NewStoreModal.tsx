"use client";

import { X, ShoppingBag, Briefcase, FileText, Sparkles } from "lucide-react";
import type { StoreTemplate } from "@/types/database";

interface NewStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStore: (template: StoreTemplate) => void;
}

interface TemplateOption {
  id: StoreTemplate;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const templates: TemplateOption[] = [
  {
    id: "goods",
    name: "Products",
    description: "Sell physical or digital products with a full e-commerce experience",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "emerald",
    features: ["Product catalog", "Shopping cart", "Inventory tracking", "Shipping zones"],
  },
  {
    id: "services",
    name: "Services",
    description: "Offer services with booking, quotes, and client management",
    icon: <Briefcase className="w-6 h-6" />,
    color: "blue",
    features: ["Service listings", "Quote requests", "Booking calendar", "Client inquiries"],
  },
  {
    id: "brochure",
    name: "Brochure",
    description: "Showcase your brand, portfolio, or business information",
    icon: <FileText className="w-6 h-6" />,
    color: "purple",
    features: ["About section", "Portfolio gallery", "Contact form", "Brand showcase"],
  },
];

/**
 * Modal for selecting a template when creating a new store.
 * Shows 3 template options: Products, Services, and Brochure.
 */
export function NewStoreModal({
  isOpen,
  onClose,
  onCreateStore,
}: NewStoreModalProps) {
  if (!isOpen) return null;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
      emerald: {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        hoverBg: "hover:bg-emerald-500/20",
      },
      blue: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
        hoverBg: "hover:bg-blue-500/20",
      },
      purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/30",
        text: "text-purple-400",
        hoverBg: "hover:bg-purple-500/20",
      },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-navy-800 rounded-2xl max-w-2xl w-full mx-4 border border-navy-700 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 border-2 border-purple-500/30 mb-4">
            <Sparkles className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Create Your Second Store
          </h2>
          <p className="text-gray-400">
            Choose a template to get started with your BOGO bonus store
          </p>
        </div>

        {/* Template Options */}
        <div className="px-6 pb-6">
          <div className="grid gap-4">
            {templates.map((template) => {
              const colors = getColorClasses(template.color);

              return (
                <button
                  key={template.id}
                  onClick={() => onCreateStore(template.id)}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${colors.bg} ${colors.border} ${colors.hoverBg}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}
                    >
                      {template.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${colors.text}`}>
                          {template.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs px-2 py-0.5 rounded bg-navy-700 text-gray-400"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 border-t border-navy-700">
          <p className="text-xs text-gray-500 text-center">
            You can customize everything after selection. Each store is completely independent.
          </p>
        </div>
      </div>
    </div>
  );
}

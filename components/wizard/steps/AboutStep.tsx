"use client";

import { FileText } from "lucide-react";
import { useWizard } from "../WizardContext";

export function AboutStep() {
  const { state, updateConfig } = useWizard();

  const templates = [
    {
      label: "The Craftsperson",
      text: `Every product we create is made with care and attention to detail. We believe in quality over quantity, and that shows in everything we do.

Our journey started with a simple idea: make products we'd be proud to use ourselves. Today, that philosophy guides every decision we make.`,
    },
    {
      label: "The Mission-Driven",
      text: `We're on a mission to change the way you think about [your industry]. By choosing us, you're not just buying a product — you're supporting a movement.

Every purchase helps us get one step closer to a better future for our community and our planet.`,
    },
    {
      label: "The Small Business",
      text: `Welcome to our little corner of the internet! We're a small team with big dreams, dedicated to bringing you the best [products] at fair prices.

Thank you for supporting small business. Every order means the world to us.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <FileText className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Tell your story
        </h2>
        <p className="text-gray-400">
          Help customers connect with your brand. What makes you different?
        </p>
      </div>

      {/* Textarea */}
      <div className="max-w-lg mx-auto">
        <textarea
          value={state.config.aboutText ?? ""}
          onChange={(e) => updateConfig({ aboutText: e.target.value })}
          placeholder="Write about your business, your values, and why customers should choose you..."
          rows={6}
          className="w-full px-4 py-4 bg-navy-900 border border-navy-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
          autoFocus
        />
        <div className="flex justify-between mt-2">
          <p className="text-sm text-gray-500">
            Aim for 2-3 short paragraphs
          </p>
          <p className="text-sm text-gray-500">
            {state.config.aboutText?.length ?? 0} characters
          </p>
        </div>
      </div>

      {/* Templates */}
      <div className="max-w-lg mx-auto">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Need a starting point?
        </p>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.label}
              onClick={() => updateConfig({ aboutText: template.text })}
              className="w-full text-left p-4 bg-navy-900/50 border border-navy-700 rounded-lg hover:border-emerald-500/50 transition-all group"
            >
              <span className="text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                {template.label}
              </span>
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {template.text.substring(0, 100)}...
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { MessageSquare } from "lucide-react";
import { useWizard } from "../WizardContext";

export function TaglineStep() {
  const { state, updateConfig } = useWizard();

  const examples = [
    "Handcrafted jewelry for the modern minimalist",
    "Premium coffee beans, roasted with love",
    "Sustainable fashion for conscious consumers",
    "Artisan candles that tell a story",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <MessageSquare className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Describe what you sell
        </h2>
        <p className="text-gray-400">
          One sentence that captures your store's essence.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-md mx-auto">
        <label htmlFor="tagline" className="sr-only">
          Tagline
        </label>
        <textarea
          id="tagline"
          value={state.config.tagline ?? ""}
          onChange={(e) => updateConfig({ tagline: e.target.value })}
          placeholder="Premium products for people who care about quality"
          rows={3}
          maxLength={150}
          className="w-full px-4 py-4 text-lg bg-navy-900 border border-navy-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
          autoFocus
        />
        <div className="flex justify-between mt-2">
          <p className="text-sm text-gray-500">Keep it short and memorable</p>
          <p className="text-sm text-gray-500">
            {state.config.tagline?.length ?? 0}/150
          </p>
        </div>
      </div>

      {/* Examples */}
      <div className="max-w-md mx-auto">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Need inspiration?
        </p>
        <div className="space-y-2">
          {examples.map((example) => (
            <button
              key={example}
              onClick={() => updateConfig({ tagline: example })}
              className="w-full text-left px-4 py-3 bg-navy-900/50 border border-navy-700 rounded-lg text-gray-300 hover:border-emerald-500/50 hover:text-white transition-all text-sm"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

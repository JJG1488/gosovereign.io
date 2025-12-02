"use client";

import { Store } from "lucide-react";
import { useWizard } from "../WizardContext";

export function StoreNameStep() {
  const { state, updateConfig } = useWizard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Store className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          What's your store called?
        </h2>
        <p className="text-gray-400">
          This will be displayed in your store header and browser tab.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-md mx-auto">
        <label htmlFor="storeName" className="sr-only">
          Store Name
        </label>
        <input
          id="storeName"
          type="text"
          value={state.config.storeName ?? ""}
          onChange={(e) => updateConfig({ storeName: e.target.value })}
          placeholder="My Awesome Store"
          className="w-full px-4 py-4 text-lg bg-navy-900 border border-navy-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          autoFocus
        />
        <p className="mt-2 text-sm text-gray-500 text-center">
          You can always change this later
        </p>
      </div>

      {/* Preview */}
      {state.config.storeName && (
        <div className="max-w-md mx-auto mt-8 p-4 bg-navy-900/50 rounded-xl border border-navy-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Preview
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-lg">
                {state.config.storeName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xl font-semibold text-white">
              {state.config.storeName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

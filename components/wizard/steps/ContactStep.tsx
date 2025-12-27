"use client";

import { Mail, Check, AlertCircle } from "lucide-react";
// import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWizard } from "../WizardContext";
import { useMemo } from "react";

// Simple email regex for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactStep() {
  const { state, updateConfig } = useWizard();
  // const [isValid, setIsValid] = useState(false);

  // useEffect(() => {
  //   // Simple email validation
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   setIsValid(emailRegex.test(email));
  // }, [email]);

  // Render the contact form step
  const email = state.config.contactEmail ?? "";
  const isValid = useMemo(() => EMAIL_REGEX.test(email), [email]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <Mail className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          How can customers reach you?
        </h2>
        <p className="text-gray-400">
          This email will be displayed on your contact page and used for customer inquiries.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-md mx-auto">
        <label htmlFor="contactEmail" className="sr-only">
          Contact Email
        </label>
        <div className="relative">
          <input
            id="contactEmail"
            type="email"
            value={email}
            onChange={(e) => updateConfig({ contactEmail: e.target.value })}
            placeholder="hello@yourstore.com"
            className={cn(
              "w-full px-4 py-4 text-lg bg-navy-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all pr-12",
              email && isValid
                ? "border-emerald-500 focus:ring-emerald-500"
                : email && !isValid
                  ? "border-red-500 focus:ring-red-500"
                  : "border-navy-600 focus:ring-emerald-500"
            )}
            autoFocus
          />
          {email && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isValid ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
          )}
        </div>
        {email && !isValid && (
          <p className="mt-2 text-sm text-red-400">
            Please enter a valid email address
          </p>
        )}
      </div>

      {/* Info cards */}
      <div className="max-w-md mx-auto mt-8 space-y-4">
        <div className="p-4 bg-navy-900/50 border border-navy-700 rounded-xl">
          <h4 className="font-medium text-white mb-1">Where will this appear?</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Contact page footer</li>
            <li>• Order confirmation emails</li>
            <li>• Customer support inquiries</li>
          </ul>
        </div>

        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <h4 className="font-medium text-emerald-400 mb-1">Pro tip</h4>
          <p className="text-sm text-gray-400">
            Consider creating a dedicated email like support@yourstore.com to keep business inquiries separate from personal email.
          </p>
        </div>
      </div>
    </div>
  );
}

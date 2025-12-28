"use client";

import { CreditCard, Check, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { useWizard } from "../WizardContext";

export function PaymentsStep() {
  const { state, storeId, updateConfig } = useWizard();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const isConnected = state.config.stripeConnected;

  // Check for Stripe callback params
  useEffect(() => {
    const stripeConnected = searchParams.get("stripe_connected");
    const stripeError = searchParams.get("error");

    if (stripeConnected === "true") {
      updateConfig({ stripeConnected: true });
    }

    if (stripeError) {
      setError(getErrorMessage(stripeError));
    }
  }, [searchParams, updateConfig]);

  const handleConnect = async () => {
    if (!storeId) {
      setError("Store not initialized. Please refresh and try again.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Get the Stripe Connect OAuth URL from our API
      const response = await fetch(`/api/stripe/connect?store=${storeId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        // Redirect to Stripe Connect
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error initiating Stripe Connect:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Stripe");
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Note: In production, you'd want to also call Stripe API to deauthorize
    updateConfig({
      stripeConnected: false,
      stripeAccountId: undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
          <CreditCard className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Connect payments
        </h2>
        <p className="text-gray-400">
          Connect your Stripe account to accept payments from customers.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Connection status */}
      <div className="max-w-md mx-auto">
        {isConnected ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Stripe Connected</p>
                <p className="text-sm text-gray-400">
                  Your store can accept payments
                </p>
              </div>
            </div>

            {state.config.stripeAccountId && (
              <div className="p-4 bg-navy-900/50 rounded-lg mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Account ID</span>
                  <span className="font-mono text-gray-300">
                    {state.config.stripeAccountId.slice(0, 16)}...
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={handleDisconnect}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Disconnect account
            </button>
          </div>
        ) : (
          <div className="p-6 bg-navy-900/50 border border-navy-700 rounded-xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800 rounded-full mb-4">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20 40C31.0457 40 40 31.0457 40 20C40 8.95431 31.0457 0 20 0C8.95431 0 0 8.95431 0 20C0 31.0457 8.95431 40 20 40Z"
                    fill="#635BFF"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.5429 16.4C18.5429 15.3867 19.3714 14.9333 20.7714 14.9333C22.8 14.9333 25.3429 15.6 27.3714 16.6667V11.8667C25.1429 10.9333 22.9429 10.5333 20.7714 10.5333C16.0571 10.5333 12.8 13.2 12.8 17.2C12.8 23.6 21.7714 22.6667 21.7714 25.4C21.7714 26.5867 20.7429 27.0667 19.2571 27.0667C17.0286 27.0667 14.2 26.1333 12 24.8667V29.7333C14.4571 30.8 16.9429 31.3333 19.2571 31.3333C24.0857 31.3333 27.5429 28.8 27.5429 24.7333C27.5143 17.8667 18.5429 18.9733 18.5429 16.4Z"
                    fill="white"
                  />
                </svg>
                <span className="font-medium text-white">Stripe</span>
              </div>
              <p className="text-sm text-gray-400">
                Secure payments powered by Stripe
              </p>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-[#635BFF] hover:bg-[#5851e0]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Connect with Stripe
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="max-w-md mx-auto space-y-4">
        <div className="p-4 bg-navy-900/50 border border-navy-700 rounded-xl">
          <h4 className="font-medium text-white mb-2">Why Stripe?</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Accept credit cards, Apple Pay, Google Pay</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Money goes directly to your bank account</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Industry-leading security and fraud protection</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>2.9% + 30¢ per transaction (standard Stripe fees)</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-400 mb-1">No Stripe account?</h4>
              <p className="text-sm text-gray-400">
                You&apos;ll be guided through creating one. It takes about 5 minutes and requires basic business information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "stripe_connect_failed":
      return "Failed to connect with Stripe. Please try again.";
    case "missing_params":
      return "Invalid callback parameters. Please try connecting again.";
    case "invalid_state":
      return "Security verification failed. Please try again.";
    case "db_update_failed":
      return "Failed to save connection. Please try again.";
    case "stripe_exchange_failed":
      return "Failed to complete Stripe authorization. Please try again.";
    default:
      return error;
  }
}

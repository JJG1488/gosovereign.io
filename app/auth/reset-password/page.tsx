"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Navigation } from "@/components/landing/Navigation";
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      // User should have a session if they clicked the recovery link
      setIsValidSession(!!session);
    };

    checkSession();

    // Listen for auth state changes (recovery link sets up a session)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    // Redirect to wizard after a short delay
    setTimeout(() => {
      router.push("/wizard");
    }, 2000);
  };

  // Still checking session
  if (isValidSession === null) {
    return (
      <>
        <Navigation logo="GoSovereign" cta="Sign Up" ctaHref="/auth/signup" />
        <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 pt-16">
          <div className="text-gray-400">Loading...</div>
        </div>
      </>
    );
  }

  // Invalid or expired session
  if (!isValidSession) {
    return (
      <>
        <Navigation logo="GoSovereign" cta="Sign Up" ctaHref="/auth/signup" />
        <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 pt-16">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <span className="text-2xl font-bold text-white">
                  Go<span className="text-emerald-500">Sovereign</span>
                </span>
              </Link>
            </div>

            <div className="bg-navy-800 rounded-2xl p-8 shadow-xl border border-gray-800 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Link</h2>
              <p className="text-gray-400 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Request New Link
              </Link>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation logo="GoSovereign" cta="Sign Up" ctaHref="/auth/signup" />
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white">
                Go<span className="text-emerald-500">Sovereign</span>
              </span>
            </Link>
            <p className="mt-2 text-gray-400">Set your new password</p>
          </div>

          {/* Form */}
          <div className="bg-navy-800 rounded-2xl p-8 shadow-xl border border-gray-800">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Password Updated!</h2>
                <p className="text-gray-400 mb-4">
                  Your password has been successfully reset.
                </p>
                <p className="text-gray-500 text-sm">
                  Redirecting you to the dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-3 bg-navy-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-navy-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

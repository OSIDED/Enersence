"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth";
import type { ApiError } from "@/types/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      const apiErr = err as ApiError;
      // 404 here specifically means the backend endpoint doesn't exist yet
      setError(
        apiErr.status === 404
          ? "Password reset isn't available yet — this feature is still being built."
          : apiErr.detail || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <p className="text-blue-600 font-bold leading-tight text-lg">
              Enersence
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              Smart Monitoring
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          {submitted ? (
            <>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Check your email
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                If an account exists for <strong>{email}</strong>, a password
                reset link has been sent.
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Forgot your password?
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@enersence.com"
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

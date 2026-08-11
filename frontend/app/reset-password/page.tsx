"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength from "@/components/auth/PasswordStrength";
import type { ApiError } from "@/types/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      const apiErr = err as ApiError;
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
          {success ? (
            <>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Password updated
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting you to sign in...
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Choose a new password for your account.
              </p>

              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                New Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              <PasswordStrength password={password} />

              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 mt-4"
              >
                Confirm New Password
              </label>
              <div className="mb-5">
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />
              </div>

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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 mt-6"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

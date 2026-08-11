"use client";

import { useState, useEffect } from "react";
import {
  X,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Headphones,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

const SUPPORT_EMAIL = "support@example.com"; // TODO: replace once a real inbox exists — see app/support/page.tsx

const NOTIFICATION_DEFAULTS = {
  highUsageAlerts: true,
  weeklyReports: true,
  billReminders: false,
};

type ToggleRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between py-4 first:pt-0">
      <div className="pr-4">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full flex items-center px-0.5 shrink-0 transition-colors ${
          checked ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px]">
          {checked ? "✓" : ""}
        </span>
      </button>
    </div>
  );
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [highUsageAlerts, setHighUsageAlerts] = useState(NOTIFICATION_DEFAULTS.highUsageAlerts);
  const [weeklyReports, setWeeklyReports] = useState(NOTIFICATION_DEFAULTS.weeklyReports);
  const [billReminders, setBillReminders] = useState(NOTIFICATION_DEFAULTS.billReminders);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load previously saved notification prefs on open, so toggles don't
  // silently reset to defaults every time the modal is reopened.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("enersence_notification_prefs");
      if (stored) {
        const prefs = JSON.parse(stored);
        setHighUsageAlerts(prefs.highUsageAlerts ?? NOTIFICATION_DEFAULTS.highUsageAlerts);
        setWeeklyReports(prefs.weeklyReports ?? NOTIFICATION_DEFAULTS.weeklyReports);
        setBillReminders(prefs.billReminders ?? NOTIFICATION_DEFAULTS.billReminders);
      }
    } catch {
      // ignore malformed/missing storage — defaults already set
    }
  }, []);

  async function handleSave() {
    setSaving(true);
    // Notification prefs persist to localStorage for now, since they
    // aren't part of the capstone's ERD. To make this durable across
    // devices, add a `user_settings` table (user_id, key, value) and a
    // Spring Boot endpoint here instead.
    localStorage.setItem(
      "enersence_notification_prefs",
      JSON.stringify({ highUsageAlerts, weeklyReports, billReminders })
    );
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  }

  function handleContactSupport() {
    const subject = encodeURIComponent("Enersence Support Request");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}`;
  }

  function handleVisitHelpCenter() {
    onClose();
    window.location.href = "/support";
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
          <button onClick={onClose} aria-label="Close settings">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Notifications */}
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-600">Notifications</h3>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 divide-y divide-slate-200 dark:divide-slate-700 mb-6">
            <ToggleRow
              label="High Usage Alerts"
              description="Get notified when energy consumption spikes abnormally."
              checked={highUsageAlerts}
              onChange={setHighUsageAlerts}
            />
            <ToggleRow
              label="Weekly Reports"
              description="Receive a summary of your energy insights every Monday."
              checked={weeklyReports}
              onChange={setWeeklyReports}
            />
            <ToggleRow
              label="Bill Reminders"
              description="Alerts 3 days before estimated billing cycle ends."
              checked={billReminders}
              onChange={setBillReminders}
            />
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-600">Privacy</h3>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => setShowPrivacyDetails((v) => !v)}
              className="w-full px-4 py-4 flex items-center justify-between text-left"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Data Sharing & Privacy</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage how your utility data is used for grid optimization.
                </p>
              </div>
              {showPrivacyDetails ? (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>
            {showPrivacyDetails && (
              <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <p>
                  Your logged appliance readings are used only to power your own dashboard,
                  reports, and recommendations — they are never shared with third parties.
                </p>
                <p>
                  Aggregated, anonymized consumption patterns may be used to improve grid
                  demand forecasting. This never includes your name, address, or account details.
                </p>
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-600">Appearance</h3>
          </div>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className="flex-1 text-center"
            >
              <div
                className={`rounded-xl border-2 p-2 mb-2 ${
                  theme === "light" ? "border-blue-600" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="bg-slate-100 rounded-lg h-20 flex items-end gap-1 p-2">
                  <div className="bg-white rounded w-1/3 h-full" />
                  <div className="bg-white rounded w-2/3 h-full" />
                </div>
              </div>
              <span className={`text-sm font-medium ${theme === "light" ? "text-blue-600" : "text-slate-600 dark:text-slate-400"}`}>
                Light Theme
              </span>
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className="flex-1 text-center"
            >
              <div
                className={`rounded-xl border-2 p-2 mb-2 ${
                  theme === "dark" ? "border-blue-600" : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="bg-slate-900 rounded-lg h-20 flex items-end gap-1 p-2">
                  <div className="bg-slate-700 rounded w-1/3 h-full" />
                  <div className="bg-slate-700 rounded w-2/3 h-full" />
                </div>
              </div>
              <span className={`text-sm font-medium ${theme === "dark" ? "text-blue-600" : "text-slate-600 dark:text-slate-400"}`}>
                Dark Theme
              </span>
            </button>
          </div>

          {/* Help & Support */}
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-600">Help & Support</h3>
          </div>
          <div className="flex gap-3 mb-2">
            <button
              onClick={handleVisitHelpCenter}
              className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Visit Help Center
            </button>
            <button
              onClick={handleContactSupport}
              className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Headphones className="w-4 h-4" /> Contact Support
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800">
          <button onClick={onClose} className="text-slate-700 dark:text-slate-300 font-medium px-4 py-2.5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

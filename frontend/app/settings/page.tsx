"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock, Moon, Sun } from "lucide-react";
import { getStoredUser } from "@/lib/auth";

const SETTINGS_OPTIONS = [
  {
    key: "theme",
    label: "Dark Mode",
    description: "Toggle between light and dark application themes.",
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Receive alerts for meter activity and usage trends.",
  },
  {
    key: "autoRefresh",
    label: "Auto Refresh",
    description: "Keep your dashboard data up to date automatically.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace("/");
      return;
    }
    setUserName(user.fullName);
    const storedTheme = window.localStorage.getItem("volt-theme");
    setTheme(storedTheme === "dark" ? "dark" : "light");
    setNotificationsEnabled(window.localStorage.getItem("volt-notifications") !== "false");
    setAutoRefreshEnabled(window.localStorage.getItem("volt-auto-refresh") !== "false");
  }, [router]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("volt-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("volt-notifications", String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    window.localStorage.setItem("volt-auto-refresh", String(autoRefreshEnabled));
  }, [autoRefreshEnabled]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Settings</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-slate-100">Manage your preferences</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Personalize your experience on Volt-vision.</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{userName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Account settings</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Theme</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark modes.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light theme" : "Dark theme"}
            </button>
          </div>

          <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Control when you get alerts from the app.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                notificationsEnabled
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">Auto Refresh</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Refresh your dashboard automatically.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoRefreshEnabled((current) => !current)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                autoRefreshEnabled
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              {autoRefreshEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-3">App Control</p>
          <p>Use the sidebar Logout button anytime to switch accounts and return to the login screen.</p>
        </div>
      </div>
    </div>
  );
}

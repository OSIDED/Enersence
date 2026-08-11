"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Zap,
  Cable,
  BarChart3,
  Headphones,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import { useAuth } from "@/lib/auth/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, href: "/" },
  { label: "Consumption", icon: Zap, href: "/consumption" },
  { label: "Devices", icon: Cable, href: "/devices" },
  { label: "Reports", icon: BarChart3, href: "/reports" },
  { label: "Insights", icon: Lightbulb, href: "/insights" },
  { label: "Support", icon: Headphones, href: "/support" },
];

const AVATAR_COLORS = [
  "#2563EB", // blue
  "#059669", // emerald
  "#D97706", // amber
  "#DB2777", // pink
  "#7C3AED", // violet
  "#DC2626", // red
  "#0891B2", // cyan
];

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function Sidebar() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();

  const sidebarContent = (
    <>
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-2 mb-8">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-blue-600 font-bold leading-tight">Enersence</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                Smart Monitoring
              </p>
            </div>
          </Link>
          {/* Close button — only shown on mobile, inside the slide-in drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-500 dark:text-slate-400"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-300/70 text-slate-900"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div>
        <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-slate-700 pt-4">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>

        {user && (
          <div className="flex items-center gap-2 px-4 pt-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: getAvatarColor(user.email) }}
              title={user.fullName}
            >
              {getInitials(user.fullName)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar — visible only below md breakpoint */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-white dark:bg-slate-800 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <p className="text-blue-600 font-bold text-sm">Enersence</p>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-slate-700 dark:text-slate-300 dark:text-slate-200"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {/* Spacer so page content isn't hidden under the fixed mobile top bar */}
      <div className="md:hidden h-[57px]" />

      {/* Desktop sidebar — always visible at md+ */}
      <aside className="hidden md:flex w-[280px] shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:bg-slate-900 min-h-screen flex-col justify-between px-4 py-6">
        {sidebarContent}
      </aside>

      {/* Mobile slide-in drawer + backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-800 dark:bg-slate-900 flex flex-col justify-between px-4 py-6 shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

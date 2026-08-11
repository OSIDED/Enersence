"use client";

import { Search, UserCircle, Settings2 } from "lucide-react";

type HeaderProps = {
  userName: string;
  userRole: string;
  onSettingsClick: () => void;
};

export default function Header({
  userName,
  userRole,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm h-20 flex items-center justify-between px-4 sm:px-8 rounded-3xl border border-slate-200 dark:border-slate-800">
      <div className="relative flex-1 max-w-xs sm:max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
        />

        <input
          type="text"
          placeholder="Search..."
          className="pl-10 w-full h-11 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        <button
          type="button"
          onClick={onSettingsClick}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 sm:px-4 py-2 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="text-right min-w-[150px]">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {userName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {userRole}
            </p>
          </div>
        </div>

        {/* Mobile profile */}
        <div className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
          {userName
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
      </div>
    </header>
  );
}

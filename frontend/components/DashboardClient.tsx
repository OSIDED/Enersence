"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BatteryCharging,
  Gauge,
  Leaf,
  Plus,
  Sun,
  Thermometer,
  Clock,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import MeterCard from "@/components/MeterCard";
import UsageChart from "@/components/UsageChart";
import Header from "@/components/header";
import SettingsModal from "@/components/SettingsModal";
import AddMeterModal from "@/components/AddMeterModal";
import { createAppliance, deleteAppliance, getAppliances, getTodaySummary, type Appliance, type DailySummary } from "@/lib/api";
import { getStoredUser, type CurrentUser } from "@/lib/auth";

type Meter = {
  id: string;
  name: string;
  serial: string;
  lastReading: string;
  status: "ONLINE" | "SYNCING";
  icon: typeof Gauge;
  iconBg: string;
  iconColor: string;
};

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeterId, setSelectedMeterId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addMeterOpen, setAddMeterOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/");
      return;
    }
    setUser(stored);
  }, [router]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("volt-theme");
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    setNotificationsEnabled(window.localStorage.getItem("volt-notifications") !== "false");
    setAutoRefreshEnabled(window.localStorage.getItem("volt-auto-refresh") !== "false");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("volt-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("volt-notifications", String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    window.localStorage.setItem("volt-auto-refresh", String(autoRefreshEnabled));
  }, [autoRefreshEnabled]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      if (!user) return;

      try {
        const appliances = await getAppliances(user.userId);
        setMeters(appliances.map((appliance) => mapApplianceToMeter(appliance)));
      } catch {
        setMeters([]);
      }

      try {
        const todaySummary = await getTodaySummary(user.userId);
        setSummary(todaySummary);
      } catch {
        setSummary(null);
      }
    }

    load();
  }, [user]);

  const selectedMeter = useMemo(
    () => meters.find((meter) => meter.id === selectedMeterId) ?? null,
    [meters, selectedMeterId],
  );

  async function handleAddMeter(meter: {
    name: string;
    serial: string;
    lastReading: string;
    status: "ONLINE" | "SYNCING";
  }) {
    if (!user) return;

    const powerRating = parseFloat(meter.lastReading.replace(/[^0-9.]/g, "")) || 0;
    try {
        const created = await createAppliance({
        userId: user.userId,
        applianceName: meter.name,
        location: meter.serial,
        powerRatingWatts: powerRating,
      });
      const newMeter = mapApplianceToMeter(created, meter.status);
      setMeters((current) => [newMeter, ...current]);
      setSelectedMeterId(newMeter.id);
    } catch {
      // ignore so UI remains responsive; backend persistence may not be available yet.
    }
  }

  async function handleDeleteSelected() {
    if (!user || !selectedMeterId) return;
    try {
      await deleteAppliance(Number(selectedMeterId), user.userId);
      setMeters((current) => current.filter((meter) => meter.id !== selectedMeterId));
      setSelectedMeterId(null);
    } catch {
      // ignore if delete fails; it will remain in the list.
    }
  }

  async function handleDeleteMeter(id: string) {
    if (!user) return;
    try {
      await deleteAppliance(Number(id), user.userId);
      setMeters((current) => current.filter((meter) => meter.id !== id));
      if (id === selectedMeterId) {
        setSelectedMeterId(null);
      }
    } catch {
      // ignore failed delete.
    }
  }

  const totalKwh = summary?.totalKwh ?? 452;
  const totalCost = summary?.totalCost ?? 84.5;
  const [dollars = "84", cents = "50"] = totalCost.toFixed(2).split(".");

  return (
    <div className="flex min-h-screen bg-[#F4F6F8] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 px-10 py-8 max-w-[1600px]">
        <Header
          onSettingsClick={() => setSettingsOpen(true)}
          userName={user?.fullName ?? "Guest"}
          userRole={user?.role === "user" ? "Smart Meter User" : user?.role ?? "Guest"}
        />

        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Energy Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Real-time metrics and insights for your home.
        </p>

        <div className="flex gap-3 flex-wrap mb-8">
          {QUICK_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-semibold text-slate-700 px-4 py-2.5 rounded-xl dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-6 flex-wrap mb-8">
          <StatCard
            label="Total Used This Month"
            value={String(totalKwh)}
            unit="kWh"
            icon={Thermometer}
            iconBg="#DBEAFE"
            iconColor="#2563EB"
            footer={
              <span className="flex items-center gap-1 text-red-500 font-medium dark:text-red-400">
                <TrendingUp className="w-3.5 h-3.5" /> +5% vs last month
              </span>
            }
          />
          <StatCard
            label="Current Power Load"
            value="1.2"
            unit="kW"
            icon={BatteryCharging}
            iconBg="#D1FAE5"
            iconColor="#059669"
            footer={
              <span className="flex items-center gap-1 text-emerald-600 font-medium dark:text-emerald-400">
                ● Normal operation
              </span>
            }
          />
          <StatCard
            label="Estimated Bill"
            value={`$${dollars}`}
            unit={`.${cents}`}
            icon={Leaf}
            iconBg="#F1F5F9"
            iconColor="#475569"
            footer={
              <span className="text-slate-500 dark:text-slate-400">
                Based on current usage trends
              </span>
            }
          />
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Connected Meters
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add meters, review readings, and manage devices from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAddMeterOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
              >
                <Plus className="w-4 h-4" /> Add New Meter
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition hover:border-red-400 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-red-950"
                disabled={!selectedMeterId}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                Delete Selected
              </button>
            </div>
          </div>

          {selectedMeter ? (
            <div className="mb-5 rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-950/70 dark:text-blue-200">
              Selected meter: <span className="font-semibold">{selectedMeter.name}</span>
            </div>
          ) : null}

          <div className="flex gap-4 flex-wrap">
            {meters.length === 0 ? (
              <div className="text-slate-500">No meters found yet. Add a meter to begin.</div>
            ) : (
              meters.map((meter) => (
                <MeterCard
                  key={meter.id}
                  id={meter.id}
                  name={meter.name}
                  serial={meter.serial}
                  lastReading={meter.lastReading}
                  status={meter.status}
                  icon={meter.icon}
                  iconBg={meter.iconBg}
                  iconColor={meter.iconColor}
                  selected={meter.id === selectedMeterId}
                  onSelect={() => setSelectedMeterId(meter.id)}
                  onDelete={() => handleDeleteMeter(meter.id)}
                />
              ))
            )}
          </div>
        </section>

        <div className="flex gap-6 flex-wrap items-start">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 flex-[2] min-w-[420px] dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Usage History (Last 7 Days)
              </h2>
              <button className="text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 dark:border-slate-700 dark:text-slate-300">
                Daily ▾
              </button>
            </div>
            <UsageChart data={USAGE_DATA} />
          </section>

          <div className="flex flex-col gap-6 flex-1 min-w-[280px]">
            <section className="bg-white rounded-2xl border-l-4 border-l-red-500 border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Active Alerts</h3>
              </div>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    Unusual Spike Detected
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    HVAC system ran 3 hours longer than usual yesterday.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Efficiency Tips</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <Thermometer className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      Optimize Thermostat
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Lowering by 2 degrees could save $15 this month.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      Shift Heavy Usage
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Run dishwasher after 9 PM for off-peak rates.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled((current) => !current)}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled((current) => !current)}
      />

      <AddMeterModal
        open={addMeterOpen}
        onClose={() => setAddMeterOpen(false)}
        onAddMeter={handleAddMeter}
      />
    </div>
  );
}

function getIconForMeter(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("solar")) return Sun;
  if (lowerName.includes("ev") || lowerName.includes("charger")) return BatteryCharging;
  if (lowerName.includes("power") || lowerName.includes("utility")) return Gauge;
  return Gauge;
}

function mapApplianceToMeter(appliance: Appliance, status: "ONLINE" | "SYNCING" = "ONLINE"): Meter {
  const icon = getIconForMeter(appliance.applianceName);
  const reading = appliance.powerRatingWatts ? `${appliance.powerRatingWatts.toFixed(1)} W` : "0.0 W";
  return {
    id: String(appliance.applianceId),
    name: appliance.applianceName,
    serial: appliance.location || "N/A",
    lastReading: reading,
    status,
    icon,
    iconBg: icon === Sun ? "#DBEAFE" : icon === BatteryCharging ? "#F1F5F9" : "#D1FAE5",
    iconColor: icon === Sun ? "#2563EB" : icon === BatteryCharging ? "#475569" : "#059669",
  };
}

const QUICK_LINKS = [
  { label: "Log Consumption", href: "/consumption" },
  { label: "Manage Devices", href: "/devices" },
  { label: "View Reports", href: "/reports" },
  { label: "Smart Insights", href: "/insights" },
  { label: "Support", href: "/support" },
];

const USAGE_DATA = [
  { day: "Mon", kwh: 9 },
  { day: "Tue", kwh: 15 },
  { day: "Wed", kwh: 12 },
  { day: "Thu", kwh: 21 },
  { day: "Fri", kwh: 18 },
  { day: "Sat", kwh: 13 },
  { day: "Sun", kwh: 6 },
];

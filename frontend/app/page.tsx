"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Zap,
  Wallet,
  Gauge,
  Sun,
  BatteryCharging,
  Plus,
  AlertTriangle,
  Leaf,
  Thermometer,
  Clock,
  Trash2,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import UsageChart from "@/components/UsageChart";
import AddMeterModal from "@/components/AddMeterModal";
import {
  getMeters,
  addMeter,
  deleteMeter,
  getWeeklyHistory,
  getRecommendations,
  getCategoryBreakdown,
  getMonthComparison,
  type Meter,
  type DailyUsage,
  type Recommendation,
  type CategoryBreakdown,
  type MonthComparison,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";

const QUICK_LINKS = [
  { label: "Log Consumption", href: "/consumption", icon: Zap },
  { label: "Manage Devices", href: "/devices", icon: BatteryCharging },
  { label: "View Reports", href: "/reports", icon: TrendingUp },
  { label: "Smart Insights", href: "/insights", icon: Leaf },
  { label: "Support", href: "/support", icon: AlertTriangle },
];

function meterIcon(type: string) {
  if (type === "solar") return Sun;
  if (type === "ev_charger") return BatteryCharging;
  return Gauge;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const USER_ID = user?.userId;
  const [meters, setMeters] = useState<Meter[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState<DailyUsage[]>([]);
  const [alerts, setAlerts] = useState<Recommendation[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<
    CategoryBreakdown[]
  >([]);
  const [monthComparison, setMonthComparison] =
    useState<MonthComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMeter, setShowAddMeter] = useState(false);
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);

  async function loadMeters() {
    try {
      const data = await getMeters(USER_ID!);
      setMeters(data);
    } catch {
      // Spring Boot not reachable yet — dashboard still renders, just with no meters
    } finally {
      setLoading(false);
    }
  }

  async function loadWeeklyUsage() {
    try {
      const data = await getWeeklyHistory(USER_ID!);
      setWeeklyUsage(data);
    } catch {
      // falls back to empty chart if unreachable
    }
  }

  async function loadAnalytics() {
    try {
      const [recs, categories, comparison] = await Promise.all([
        getRecommendations(USER_ID!),
        getCategoryBreakdown(USER_ID!),
        getMonthComparison(USER_ID!),
      ]);
      setAlerts(recs);
      setCategoryBreakdown(categories);
      setMonthComparison(comparison);
    } catch {
      // Analytics not reachable yet — sections show honest empty states
    }
  }

  useEffect(() => {
    if (!USER_ID) return;
    loadMeters();
    loadWeeklyUsage();
    loadAnalytics();
  }, [USER_ID]);

  async function handleAddMeter(payload: {
    meterName: string;
    serialNumber: string;
    meterType: string;
  }) {
    await addMeter({ userId: USER_ID!, ...payload });
    await loadMeters();
  }

  async function handleDeleteMeter(meterId: number) {
    await deleteMeter(meterId);
    setSelectedMeterId(null);
    await loadMeters();
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F4F6F8] dark:bg-slate-900">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-[1600px] w-full">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
          Energy Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Real-time metrics and insights for your home.
        </p>

        <div className="flex gap-3 flex-wrap mb-8">
          {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl"
            >
              <Icon className="w-4 h-4 text-blue-600" />
              {label}
            </Link>
          ))}
        </div>

        {/* Top stat cards */}
        <div className="flex gap-6 flex-wrap mb-8">
          <StatCard
            label="Total Used This Month"
            value={
              monthComparison ? monthComparison.currentMonthKwh.toFixed(1) : "0"
            }
            unit="kWh"
            icon={TrendingUp}
            iconBg="#DBEAFE"
            iconColor="#2563EB"
            footer={
              monthComparison && monthComparison.previousMonthKwh > 0 ? (
                <span
                  className={`flex items-center gap-1 font-medium ${
                    monthComparison.percentChange >= 0
                      ? "text-red-500"
                      : "text-emerald-600"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  {monthComparison.percentChange >= 0 ? "+" : ""}
                  {monthComparison.percentChange}% vs last month
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Not enough data yet
                </span>
              )
            }
          />
          <StatCard
            label="Current Power Load"
            value="1.2"
            unit="kW"
            icon={Zap}
            iconBg="#D1FAE5"
            iconColor="#059669"
            footer={
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                ● Normal operation
              </span>
            }
          />
          <StatCard
            label="Estimated Bill"
            value={
              monthComparison
                ? `GHS ${Math.floor(monthComparison.estimatedBill)}`
                : "GHS 0"
            }
            unit={
              monthComparison
                ? `.${Math.round((monthComparison.estimatedBill % 1) * 100)
                    .toString()
                    .padStart(2, "0")}`
                : ".00"
            }
            icon={Wallet}
            iconBg="#F1F5F9"
            iconColor="#475569"
            footer={
              <span className="text-slate-500 dark:text-slate-400">
                Based on the last 30 days of logged usage
              </span>
            }
          />
        </div>

        {/* Connected Meters — real data */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Connected Meters
            </h2>
            <button
              onClick={() => setShowAddMeter(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
            >
              <Plus className="w-4 h-4" /> Add New Meter
            </button>
          </div>

          {loading ? (
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 flex-1 min-w-full sm:min-w-[240px] rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : meters.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
              No meters connected yet. Click &quot;Add New Meter&quot; to get
              started.
            </p>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {meters.map((m) => {
                const Icon = meterIcon(m.meterType);
                const selected = selectedMeterId === m.meterId;
                return (
                  <button
                    key={m.meterId}
                    onClick={() =>
                      setSelectedMeterId(selected ? null : m.meterId)
                    }
                    className={`text-left flex items-start gap-3 bg-white dark:bg-slate-800 rounded-2xl border p-5 flex-1 min-w-full sm:min-w-[240px] transition-colors ${
                      selected
                        ? "border-blue-400 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-white text-[15px] leading-tight">
                          {m.meterName}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                            m.status === "ONLINE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        SN: {m.serialNumber}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-slate-500 dark:text-slate-400">
                          Last:{" "}
                        </span>
                        <span className="text-blue-600 font-semibold">
                          {m.lastReadingKwh} kWh
                        </span>
                      </p>
                      {selected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeter(m.meterId);
                          }}
                          className="mt-3 flex items-center gap-1.5 text-red-600 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Meter
                        </button>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Usage history + side panels */}
        <div className="flex gap-6 flex-wrap items-start">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex-[2] min-w-full md:min-w-[420px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Usage History (Last 7 Days)
              </h2>
              <button className="text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5">
                Daily ▾
              </button>
            </div>
            <UsageChart
              data={weeklyUsage.map((d) => ({
                day: d.dayLabel,
                kwh: d.totalKwh,
              }))}
            />
          </section>

          <div className="flex flex-col gap-6 flex-1 min-w-full md:min-w-[280px]">
            <section className="bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-l-red-500 border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Active Alerts
                </h3>
              </div>
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No alerts right now. Log a few high-usage appliance readings
                  and our analysis will flag anything unusual here.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {alerts.slice(0, 3).map((a) => (
                    <div key={a.recommendationId} className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm capitalize">
                          {a.recommendationType.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {a.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Efficiency Tips
                </h3>
              </div>
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Log a few days of appliance usage and we&apos;ll surface
                  patterns in your consumption by category here.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Thermometer className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {categoryBreakdown[0].category} is your top category
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {categoryBreakdown[0].percentage}% of your logged usage
                        ({categoryBreakdown[0].totalKwh} kWh) comes from{" "}
                        {categoryBreakdown[0].category.toLowerCase()}. Reducing
                        hours here has the biggest impact on your bill.
                      </p>
                    </div>
                  </div>
                  {categoryBreakdown.length > 1 && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {categoryBreakdown.length} categories tracked
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Your usage spans{" "}
                          {categoryBreakdown.map((c) => c.category).join(", ")}{" "}
                          — check the Reports page for the full breakdown.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {showAddMeter && (
        <AddMeterModal
          onClose={() => setShowAddMeter(false)}
          onAdd={handleAddMeter}
        />
      )}
    </div>
  );
}

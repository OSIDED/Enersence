"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Download,
  TrendingDown,
  TrendingUp,
  DollarSign,
  FileText,
  RefreshCw,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DonutChart from "@/components/DonutChart";
import {
  getCategoryBreakdown,
  getMonthComparison,
  getReports,
  generateReport,
  getWeeklyHistory,
  type CategoryBreakdown,
  type MonthComparison,
  type Report,
  type DailyUsage,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";

const CHART_COLORS = [
  "#2563EB",
  "#34D399",
  "#C7D2FE",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
];

export default function ReportsPage() {
  const { user } = useAuth();
  const USER_ID = user?.userId;

  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [comparison, setComparison] = useState<MonthComparison | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [weeklyUsage, setWeeklyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  async function load(isRefresh = false) {
    if (!USER_ID) return;
    if (isRefresh) setRefreshing(true);
    try {
      const [c, m, r, w] = await Promise.all([
        getCategoryBreakdown(USER_ID),
        getMonthComparison(USER_ID),
        getReports(USER_ID),
        getWeeklyHistory(USER_ID),
      ]);
      setCategories(c);
      setComparison(m);
      setReports(r);
      setWeeklyUsage(w);
    } catch {
      // Backend not reachable — page still renders with empty states
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [USER_ID]);

  async function handleExportAll() {
    if (!USER_ID) return;
    setExporting(true);
    try {
      const updated = await generateReport(USER_ID);
      setReports(updated);
    } catch {
      // silently keep old list if generation fails — Export All button
      // stays enabled so the user can retry
    } finally {
      setExporting(false);
    }
  }

  // Peak day is derived from the real 7-day usage history — a small,
  // honest stand-in for a full time-of-day peak analysis, since the
  // schema doesn't record which HOUR each reading happened at.
  const peakDay = weeklyUsage.length
    ? weeklyUsage.reduce(
        (max, d) => (d.totalKwh > max.totalKwh ? d : max),
        weeklyUsage[0],
      )
    : null;

  const filteredReports = reports.filter((r) =>
    `${r.reportType} ${r.startDate} ${r.endDate}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );

  const donutData = categories.map((c, i) => ({
    name: c.category,
    value: c.totalKwh,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const totalKwh = categories.reduce((sum, c) => sum + c.totalKwh, 0);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F4F6F8] dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-[1600px] w-full">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
              Energy Reports
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Detailed analytics and historical billing data.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={handleExportAll}
              disabled={exporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
            >
              <Download className="w-4 h-4" />{" "}
              {exporting ? "Generating..." : "Export All"}
            </button>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap mb-8 items-stretch">
          {/* Consumption by Category — real data */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex-1 min-w-full md:min-w-[320px]">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Consumption by Category
            </h2>
            {loading ? (
              <div className="h-[260px] rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-16 text-center">
                No readings logged yet. Once you log appliance usage, your
                category breakdown appears here.
              </p>
            ) : (
              <>
                <DonutChart
                  data={donutData}
                  centerValue={totalKwh.toFixed(1)}
                  centerLabel="kWh"
                />
                <div className="flex flex-col gap-3 mt-2">
                  {categories.map((c, i) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        {c.category}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {c.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <div className="flex flex-col gap-6 flex-1 min-w-full md:min-w-[280px]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  {comparison && comparison.percentChange <= 0 ? (
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                {comparison && comparison.previousMonthKwh > 0 && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      comparison.percentChange <= 0
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {comparison.percentChange >= 0 ? "+" : ""}
                    {comparison.percentChange}%
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Vs. Last Month
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {comparison
                  ? `${comparison.kwhChange >= 0 ? "+" : ""}${comparison.kwhChange} kWh`
                  : "—"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {comparison && comparison.previousMonthKwh > 0
                  ? comparison.percentChange <= 0
                    ? "Nice work — your usage dropped compared to the prior 30 days."
                    : "Your usage increased compared to the prior 30 days."
                  : "Log readings across two 30-day periods to see a month-over-month comparison."}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                Estimated Bill (30 days)
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                GHS {comparison ? comparison.estimatedBill.toFixed(2) : "0.00"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Based on your logged readings from the last 30 days.
              </p>
            </div>
          </div>

          {/* Peak day — derived from real 7-day usage history */}
          <section className="bg-blue-600 rounded-2xl p-6 flex-1 min-w-full md:min-w-[280px] text-white flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-3">Peak Usage Day</h2>
              {peakDay && peakDay.totalKwh > 0 ? (
                <p className="text-sm text-blue-100 leading-relaxed">
                  Your highest usage in the last 7 days was on{" "}
                  <strong>{peakDay.dayLabel}</strong>, at{" "}
                  <strong>{peakDay.totalKwh} kWh</strong>. Spreading heavy
                  appliance use across more days can help flatten your peak
                  demand.
                </p>
              ) : (
                <p className="text-sm text-blue-100 leading-relaxed">
                  Log a few days of appliance usage and we&apos;ll identify your
                  highest-consumption day here.
                </p>
              )}
            </div>
            <button
              onClick={() => (window.location.href = "/consumption")}
              className="mt-5 bg-white text-blue-600 font-semibold text-sm rounded-xl px-4 py-2.5 self-start"
            >
              Log More Readings
            </button>
          </section>
        </div>

        {/* Historical bills — real Reports table */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Historical Reports
            </h2>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..."
                className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl pl-4 pr-9 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No reports generated yet. Click &quot;Export All&quot; above to
                generate one from your logged readings.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
              No reports match &quot;{searchTerm}&quot;.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-900/50">
                    <th className="py-3 px-3 rounded-l-lg">Period</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Consumption (kWh)</th>
                    <th className="py-3 px-3">Estimated Cost</th>
                    <th className="py-3 px-3 rounded-r-lg">Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredReports.map((r) => (
                    <tr key={r.reportId}>
                      <td className="py-4 px-3 font-medium text-slate-900 dark:text-white">
                        {r.startDate} → {r.endDate}
                      </td>
                      <td className="py-4 px-3 text-slate-700 dark:text-slate-300 capitalize">
                        {r.reportType}
                      </td>
                      <td className="py-4 px-3 text-slate-700 dark:text-slate-300">
                        {r.totalConsumptionKwh}
                      </td>
                      <td className="py-4 px-3 text-slate-700 dark:text-slate-300">
                        GHS {r.estimatedTotalCost.toFixed(2)}
                      </td>
                      <td className="py-4 px-3">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                          <FileText className="w-3.5 h-3.5" />
                          {new Date(r.generatedAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

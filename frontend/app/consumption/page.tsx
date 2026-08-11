"use client";

import { useState, useEffect } from "react";
import { Save, Filter, Snowflake, ArrowUpDown, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  getAppliances,
  getTodayReadings,
  type Appliance,
  type Reading,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

export default function ConsumptionPage() {
  const { user } = useAuth();
  const USER_ID = user?.userId;
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [preview, setPreview] = useState({
    energyUsedKwh: 0,
    estimatedCost: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"none" | "kwh_desc" | "kwh_asc">("none");

  // Load appliances + today's readings on mount. Appliances added on the
  // Devices page show up here automatically — both pages read the same
  // Spring Boot /api/appliances endpoint, no separate sync needed.
  useEffect(() => {
    if (!USER_ID) return;
    async function load() {
      try {
        const [a, r] = await Promise.all([
          getAppliances(USER_ID!),
          getTodayReadings(USER_ID!),
        ]);
        setAppliances(a);
        setReadings(r);
      } catch {
        // Backend not reachable — page still renders with empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [USER_ID]);

  // Live preview: recompute whenever appliance or hours change
  useEffect(() => {
    const appliance = appliances.find(
      (a) => String(a.applianceId) === selectedApplianceId,
    );
    const hoursNum = parseFloat(hours);
    if (!appliance || isNaN(hoursNum)) {
      setPreview({ energyUsedKwh: 0, estimatedCost: 0 });
      return;
    }
    fetch(`${API_BASE}/api/calculate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        powerRatingWatts: appliance.powerRatingWatts,
        hoursUsed: hoursNum,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setPreview)
      .catch(() => setPreview({ energyUsedKwh: 0, estimatedCost: 0 }));
  }, [selectedApplianceId, hours, appliances]);

  async function handleSave() {
    setMessage(null);
    const hoursNum = parseFloat(hours);
    if (!selectedApplianceId || isNaN(hoursNum) || hoursNum <= 0) {
      setMessage({
        type: "error",
        text: "Please select an appliance and enter valid hours",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/readings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID!,
          applianceId: Number(selectedApplianceId),
          hoursUsed: hoursNum,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "success", text: "Reading saved successfully" });
      setHours("");
      setSelectedApplianceId("");
      const r = await getTodayReadings(USER_ID!);
      setReadings(r);
    } catch {
      setMessage({
        type: "error",
        text: "Please select an appliance and enter valid hours",
      });
    } finally {
      setSaving(false);
    }
  }

  const filteredReadings = readings
    .filter((r) =>
      r.applianceName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "kwh_desc") return b.energyUsedKwh - a.energyUsedKwh;
      if (sortBy === "kwh_asc") return a.energyUsedKwh - b.energyUsedKwh;
      return 0;
    });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F4F6F8] dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-[1600px] w-full">
        <h1 className="text-4xl font-bold text-blue-600 mb-1">
          Daily Consumption Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Track your appliance usage and see your estimated energy cost.
        </p>

        <div className="flex gap-6 flex-wrap items-start">
          {/* Log Usage form */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex-1 min-w-full sm:min-w-[340px] max-w-[460px]">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">
              Log Usage
            </h2>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Appliance
            </label>
            {loading ? (
              <div className="h-[52px] rounded-xl bg-slate-100 animate-pulse mb-4" />
            ) : appliances.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 rounded-xl px-4 py-3 mb-4">
                You haven&apos;t added any appliances yet. Add one from the
                Devices page.
              </p>
            ) : (
              <select
                value={selectedApplianceId}
                onChange={(e) => setSelectedApplianceId(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an appliance...</option>
                {appliances.map((a) => (
                  <option key={a.applianceId} value={a.applianceId}>
                    {a.label}
                  </option>
                ))}
              </select>
            )}

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Hours Used Today
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="24"
              placeholder="e.g. 3.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Live preview */}
            <div className="bg-slate-50 rounded-xl divide-y divide-slate-200 mb-5">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Estimated Energy Used
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {preview.energyUsedKwh.toFixed(2)}{" "}
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    kWh
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Estimated Cost
                </span>
                <span className="text-2xl font-bold text-red-500">
                  {preview.estimatedCost.toFixed(2)}{" "}
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    GHS
                  </span>
                </span>
              </div>
            </div>

            {message && (
              <div
                className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors text-white font-semibold py-3.5 rounded-xl"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Reading"}
            </button>
          </section>

          {/* Today's Logged Appliances */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex-[1.4] min-w-full md:min-w-[420px]">
            <div className="flex items-center justify-between mb-3 relative">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Today&apos;s Logged Appliances
              </h2>
              <button
                onClick={() => setShowFilter((v) => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  showFilter || searchTerm || sortBy !== "none"
                    ? "bg-blue-50 text-blue-600"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filter
              </button>

              {showFilter && (
                <div className="absolute right-0 top-10 z-10 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Filter appliances
                    </p>
                    <button onClick={() => setShowFilter(false)}>
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Search by name
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="e.g. Refrigerator"
                    className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Sort by
                  </label>
                  <div className="flex gap-2 mb-1">
                    <button
                      onClick={() =>
                        setSortBy(sortBy === "kwh_desc" ? "none" : "kwh_desc")
                      }
                      className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2 py-2 rounded-lg border ${
                        sortBy === "kwh_desc"
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <ArrowUpDown className="w-3 h-3" /> kWh: High → Low
                    </button>
                    <button
                      onClick={() =>
                        setSortBy(sortBy === "kwh_asc" ? "none" : "kwh_asc")
                      }
                      className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2 py-2 rounded-lg border ${
                        sortBy === "kwh_asc"
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <ArrowUpDown className="w-3 h-3" /> kWh: Low → High
                    </button>
                  </div>

                  {(searchTerm || sortBy !== "none") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSortBy("none");
                      }}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 mt-2 underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {readings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                No appliances logged yet today.
              </p>
            ) : filteredReadings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                No appliances match &quot;{searchTerm}&quot;.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <th className="pb-3 font-semibold">Appliance</th>
                      <th className="pb-3 font-semibold">Hours</th>
                      <th className="pb-3 font-semibold">kWh</th>
                      <th className="pb-3 font-semibold">Cost (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReadings.map((r) => (
                      <tr key={r.readingId}>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                              <Snowflake className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {r.applianceName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-slate-700 dark:text-slate-300">
                          {r.hoursUsed.toFixed(1)}
                        </td>
                        <td className="py-3.5 text-blue-600 font-semibold">
                          {r.energyUsedKwh.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-slate-700 dark:text-slate-300">
                          {r.estimatedCost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

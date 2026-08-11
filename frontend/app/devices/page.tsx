"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Snowflake,
  Trash2,
  Gauge,
  Sun,
  BatteryCharging,
  Info,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import AddDeviceModal from "@/components/AddDeviceModal";
import {
  getMeters,
  getAppliances,
  addAppliance,
  deleteAppliance,
  type Meter,
  type Appliance,
} from "@/lib/api";
import { useAuth } from "@/lib/auth/AuthContext";

function meterIcon(type: string) {
  if (type === "solar") return Sun;
  if (type === "ev_charger") return BatteryCharging;
  return Gauge;
}

export default function DevicesPage() {
  const { user } = useAuth();
  const USER_ID = user?.userId;

  const [meters, setMeters] = useState<Meter[]>([]);
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);
  const [devices, setDevices] = useState<Appliance[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Load meters first — devices can't be added or shown until one is picked.
  useEffect(() => {
    if (!USER_ID) return;
    getMeters(USER_ID)
      .then((data) => {
        setMeters(data);
        if (data.length === 1) setSelectedMeterId(data[0].meterId); // auto-select if there's only one
      })
      .catch(() => {})
      .finally(() => setLoadingMeters(false));
  }, [USER_ID]);

  async function loadDevices(meterId: number) {
    if (!USER_ID) return;
    setLoadingDevices(true);
    try {
      const data = await getAppliances(USER_ID, meterId);
      setDevices(data);
    } catch {
      setDevices([]);
    } finally {
      setLoadingDevices(false);
    }
  }

  useEffect(() => {
    if (selectedMeterId) loadDevices(selectedMeterId);
    else setDevices([]);
  }, [selectedMeterId, USER_ID]);

  async function handleAdd(payload: {
    applianceName: string;
    category: string;
    powerRatingWatts: number;
    location: string;
  }) {
    if (!selectedMeterId || !USER_ID) return;
    await addAppliance({
      userId: USER_ID,
      meterId: selectedMeterId,
      ...payload,
    });
    await loadDevices(selectedMeterId);
  }

  async function handleDelete(applianceId: number) {
    if (!confirm("Delete this device? This cannot be undone.")) return;
    try {
      await deleteAppliance(applianceId);
      if (selectedMeterId) await loadDevices(selectedMeterId);
    } catch {
      alert(
        "Couldn't delete this device — it may have logged readings tied to it.",
      );
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F4F6F8] dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8 max-w-[1600px] w-full">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
            Device Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Select a meter, then monitor and register the appliances connected
            to it.
          </p>
        </div>

        {/* Meter selector — required before anything else on this page works */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
            1. Select a meter
          </h2>

          {loadingMeters ? (
            <div className="flex gap-3 flex-wrap">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 flex-1 min-w-full sm:min-w-[200px] rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse"
                />
              ))}
            </div>
          ) : meters.length === 0 ? (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-sm rounded-xl px-4 py-3">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                You don&apos;t have any meters yet. Go to the{" "}
                <a href="/" className="underline font-medium">
                  Dashboard
                </a>{" "}
                and click &quot;Add New Meter&quot; before you can register
                devices.
              </p>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {meters.map((m) => {
                const Icon = meterIcon(m.meterType);
                const active = selectedMeterId === m.meterId;
                return (
                  <button
                    key={m.meterId}
                    onClick={() => setSelectedMeterId(m.meterId)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 flex-1 min-w-full sm:min-w-[220px] text-left transition-colors ${
                      active
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-100 dark:ring-blue-900/40"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {m.meterName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        SN: {m.serialNumber}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Devices for the selected meter */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Devices {selectedMeterId ? "on this meter" : ""}
          </h2>
          <button
            onClick={() => setShowAdd(true)}
            disabled={!selectedMeterId}
            title={!selectedMeterId ? "Select a meter first" : undefined}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed dark:disabled:bg-slate-700 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add New Device
          </button>
        </div>

        {!selectedMeterId ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
            Select a meter above to view or add its devices.
          </p>
        ) : loadingDevices ? (
          <div className="flex gap-4 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 flex-1 min-w-full sm:min-w-[260px] max-w-[380px] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse"
              />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
            No devices on this meter yet. Click &quot;Add New Device&quot; to
            register one.
          </p>
        ) : (
          <div className="flex gap-4 flex-wrap">
            {devices.map((d) => (
              <div
                key={d.applianceId}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex-1 min-w-full sm:min-w-[260px] max-w-[380px]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <Snowflake className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-base leading-tight text-slate-900 dark:text-white truncate">
                        {d.applianceName}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {d.location || "No location set"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(d.applianceId)}
                    className="text-red-500 hover:text-red-700 shrink-0"
                    title="Delete device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Power Rating
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {d.powerRatingWatts.toLocaleString()}{" "}
                  <span className="text-base font-medium text-slate-400">
                    W
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAdd && selectedMeterId && (
        <AddDeviceModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}

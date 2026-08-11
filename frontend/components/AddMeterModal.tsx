"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AddMeterModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (payload: {
    meterName: string;
    serialNumber: string;
    meterType: string;
  }) => Promise<void>;
}) {
  const [meterName, setMeterName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [meterType, setMeterType] = useState("utility");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!meterName.trim()) {
      setError("Meter name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onAdd({ meterName, serialNumber, meterType });
      onClose();
    } catch {
      setError("Failed to add meter. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add New Meter
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Meter Name
        </label>
        <input
          type="text"
          value={meterName}
          onChange={(e) => setMeterName(e.target.value)}
          placeholder="e.g. Main Utility Meter"
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Serial Number
        </label>
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="e.g. LUM-8829-X"
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Meter Type
        </label>
        <select
          value={meterType}
          onChange={(e) => setMeterType(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="utility">Utility</option>
          <option value="solar">Solar Inverter</option>
          <option value="ev_charger">EV Charger</option>
        </select>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {saving ? "Adding..." : "Add Meter"}
          </button>
        </div>
      </div>
    </div>
  );
}

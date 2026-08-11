"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AddDeviceModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (payload: {
    applianceName: string;
    category: string;
    powerRatingWatts: number;
    location: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [watts, setWatts] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const wattsNum = parseFloat(watts);
    if (!name.trim() || isNaN(wattsNum) || wattsNum <= 0) {
      setError("Please enter a device name and a valid power rating (watts)");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onAdd({
        applianceName: name,
        category,
        powerRatingWatts: wattsNum,
        location,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add device. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Add New Device
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Device Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Living Room AC"
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Category
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Cooling"
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Power Rating (Watts)
        </label>
        <input
          type="number"
          value={watts}
          onChange={(e) => setWatts(e.target.value)}
          placeholder="e.g. 1500"
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Living Room"
          className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
            {saving ? "Adding..." : "Add Device"}
          </button>
        </div>
      </div>
    </div>
  );
}

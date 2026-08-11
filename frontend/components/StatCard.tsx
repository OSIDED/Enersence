import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  footer: React.ReactNode;
};

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  iconBg,
  iconColor,
  footer,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex-1 min-w-[260px] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-4xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
        <span className="text-lg text-slate-500 dark:text-slate-400 font-medium">
          {unit}
        </span>
      </div>
      <div className="text-sm">{footer}</div>
    </div>
  );
}

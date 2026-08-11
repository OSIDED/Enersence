import { LucideIcon } from "lucide-react";

type MeterCardProps = {
  name: string;
  serial: string;
  lastReading: string;
  status: "ONLINE" | "SYNCING";
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export default function MeterCard({
  name,
  serial,
  lastReading,
  status,
  icon: Icon,
  iconBg,
  iconColor,
}: MeterCardProps) {
  const statusStyles =
    status === "ONLINE"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-slate-200 text-slate-600";

  return (
    <div className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex-1 min-w-[240px]">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-slate-900 dark:text-white text-[15px] leading-tight">
            {name}
          </p>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${statusStyles}`}
          >
            {status}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          SN: {serial}
        </p>
        <p className="text-sm mt-1">
          <span className="text-slate-500 dark:text-slate-400">Last: </span>
          <span className="text-blue-600 font-semibold">{lastReading}</span>
        </p>
      </div>
    </div>
  );
}

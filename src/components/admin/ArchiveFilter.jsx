import { useState } from "react";
import { CalendarRange } from "lucide-react";

const PERIODS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "Last Week" },
  { id: "month", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

export default function ArchiveFilter({ onChange }) {
  const [periodId, setPeriodId] = useState("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const apply = (nextPeriod, nextFrom, nextTo) => {
    onChange({
      period: nextPeriod === "custom" ? undefined : nextPeriod,
      from: nextPeriod === "custom" ? nextFrom || undefined : undefined,
      to: nextPeriod === "custom" ? nextTo || undefined : undefined,
    });
  };

  const handlePeriod = (id) => {
    setPeriodId(id);
    if (id !== "custom") {
      apply(id, from, to);
    }
  };

  const handleFrom = (value) => {
    setFrom(value);
    if (value || to) apply("custom", value, to);
  };

  const handleTo = (value) => {
    setTo(value);
    if (from || value) apply("custom", from, value);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-dark-800/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 font-body text-[11px] uppercase tracking-wider text-white/50">
          <CalendarRange className="h-3.5 w-3.5 text-brand-400" /> View history
        </span>
        {PERIODS.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => handlePeriod(period.id)}
            className={`rounded-lg px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
              periodId === period.id
                ? "bg-brand-500 text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {periodId === "custom" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 font-body text-xs text-white/60">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => handleFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-dark-900/80 px-3 py-1.5 font-body text-sm text-white focus:border-brand-400/50 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 font-body text-xs text-white/60">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => handleTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-dark-900/80 px-3 py-1.5 font-body text-sm text-white focus:border-brand-400/50 focus:outline-none"
            />
          </label>
          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
                setPeriodId("today");
                apply("today", "", "");
              }}
              className="text-xs font-body text-white/40 hover:text-brand-400 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}
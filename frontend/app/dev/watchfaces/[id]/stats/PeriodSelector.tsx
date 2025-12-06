"use client";

export default function PeriodSelector({ period, onChange }) {
  const PERIODS = [
    { id: "24h", label: "24 часа" },
    { id: "7d", label: "7 дней" },
    { id: "30d", label: "30 дней" },
    { id: "90d", label: "90 дней" },
    { id: "all", label: "Все время" },
  ];

  return (
    <div className="flex gap-2 mb-8 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-4 py-2 rounded-lg border transition backdrop-blur-sm ${
            period === p.id
              ? "bg-blue-600/90 text-white border-blue-600/50 dark:bg-blue-500/90 dark:border-blue-500/50 shadow-md"
              : "bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 shadow-sm"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

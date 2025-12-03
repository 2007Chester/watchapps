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
    <div className="flex gap-2 mb-8">
      {PERIODS.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-4 py-2 rounded-lg border transition ${
            period === p.id
              ? "bg-white text-black border-white"
              : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function StatsChart({ chart }) {
  // Преобразуем данные из объекта в массив
  const data = Object.keys(chart).map((day) => ({
    day,
    views: chart[day].views || 0,
    clicks: chart[day].clicks || 0,
    sales: chart[day].sales || 0,
    downloads: chart[day].downloads || 0,
    revenue: chart[day].revenue || 0,
  }));

  return (
    <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Статистика за период</h3>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="day"
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
              tick={{ fill: "currentColor" }}
            />
            <YAxis className="text-gray-600 dark:text-gray-400" tick={{ fill: "currentColor" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              tick={{ fill: "#10b981" }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const isDark = document.documentElement.classList.contains('dark');
                  return (
                    <div
                      className="backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl p-3"
                      style={{
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {label}
                      </p>
                      {payload.map((entry: any, index: number) => (
                        <p
                          key={index}
                          className="text-xs text-gray-700 dark:text-gray-300"
                          style={{ color: entry.color }}
                        >
                          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('ru-RU') : entry.value}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ color: "var(--tw-text-gray-900, #111827)" }} />

            <Line
              type="monotone"
              dataKey="views"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              name="Просмотры"
            />

            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
              name="Клики"
            />

            <Line
              type="monotone"
              dataKey="sales"
              stroke="#ffc658"
              strokeWidth={2}
              dot={false}
              name="Покупки"
            />
            <Line
              type="monotone"
              dataKey="downloads"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name="Скачивания"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="Доход (₽)"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

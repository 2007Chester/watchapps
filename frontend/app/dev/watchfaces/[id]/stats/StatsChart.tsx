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
    views: chart[day].views,
    clicks: chart[day].clicks,
    sales: chart[day].sales,
  }));

  return (
    <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">Статистика за период</h3>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              stroke="#bbb"
              fontSize={12}
              tick={{ fill: "#bbb" }}
            />
            <YAxis stroke="#bbb" tick={{ fill: "#bbb" }} />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #444" }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend />

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
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

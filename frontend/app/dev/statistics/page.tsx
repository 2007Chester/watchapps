"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import MonthPicker from "./MonthPicker";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type StatisticsData = {
  period: {
    start: string;
    end: string;
    month: string;
  };
  summary: {
    monthly_revenue: number;
    monthly_sales: number;
    monthly_downloads: number;
  };
  watchfaces: Array<{
    id: number;
    title: string;
    slug: string;
    price: number;
    is_free: boolean;
    status: string;
    icon: string | null;
    views: number;
    sales: number;
    downloads: number;
    revenue: number;
    rating: number | null;
    rating_count: number;
  }>;
  chart: Record<string, {
    revenue: number;
    sales: number;
    downloads: number;
  }>;
};

export default function StatisticsPage() {
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStats(selectedMonth: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch(`/dev/statistics?month=${selectedMonth}`);
      setStats(data);
    } catch (err: any) {
      console.error("Error loading statistics:", err);
      setError(err.message || "Ошибка загрузки статистики");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats(month);
  }, [month]);


  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка статистики...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Преобразуем данные графика в массив
  const chartData = Object.keys(stats.chart).map((day) => ({
    day: new Date(day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    revenue: stats.chart[day].revenue,
    sales: stats.chart[day].sales,
    downloads: stats.chart[day].downloads,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Статистика разработчика
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Аналитика продаж, скачиваний и просмотров ваших приложений
        </p>
      </div>

      {/* Выбор месяца */}
      <div className="mb-6">
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {/* Сводные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Месячный доход"
          value={`${stats.summary.monthly_revenue.toFixed(2)} ₽`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Продажи за месяц"
          value={stats.summary.monthly_sales.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Скачивания за месяц"
          value={stats.summary.monthly_downloads.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* График по дням */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 rounded-xl p-6 mb-8 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Статистика по дням
        </h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="day"
                stroke="#6b7280"
                className="dark:stroke-gray-400 dark:fill-gray-400"
                tick={{ fill: "#6b7280" }}
              />
              <YAxis
                stroke="#6b7280"
                className="dark:stroke-gray-400 dark:fill-gray-400"
                tick={{ fill: "#6b7280" }}
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
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Доход (₽)"
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Продажи"
              />
              <Line
                type="monotone"
                dataKey="downloads"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="Скачивания"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Статистика по циферблатам */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Статистика по приложениям
        </h2>
        {stats.watchfaces.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Нет данных за выбранный период
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Приложение
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Просмотры
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Продажи
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Скачивания
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Доход
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Рейтинг
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.watchfaces.map((watchface) => (
                  <tr
                    key={watchface.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {watchface.icon ? (
                          <img
                            src={watchface.icon}
                            alt={watchface.title}
                            className="w-12 h-12 rounded-lg object-cover border border-white/20 dark:border-gray-700/30 shadow-sm flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 border border-white/20 dark:border-gray-700/30 shadow-sm flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-6 h-6 text-gray-400 dark:text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {watchface.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {watchface.is_free ? "Бесплатно" : `${watchface.price} ₽`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 dark:text-white">
                      {watchface.views}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 dark:text-white">
                      {watchface.sales}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900 dark:text-white">
                      {watchface.downloads}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {watchface.revenue.toFixed(2)} ₽
                    </td>
                    <td className="text-right py-3 px-4">
                      {watchface.rating !== null ? (
                        <div className="flex items-center justify-end gap-1">
                          <svg
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {watchface.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({watchface.rating_count})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Link
                        href={`/dev/watchfaces/${watchface.id}/stats`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Подробнее
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "green" | "blue" | "purple";
}) {
  const colorClasses = {
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className={`border rounded-xl p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}


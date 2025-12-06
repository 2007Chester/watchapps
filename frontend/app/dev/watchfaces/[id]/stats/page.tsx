"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PeriodSelector from "./PeriodSelector";
import StatsChart from "./StatsChart";

export default function StatsPage({ params }) {
  const watchfaceId = params.id;

  const [period, setPeriod] = useState("30d");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStats(selectedPeriod) {
    setLoading(true);

    try {
      const data = await apiFetch(`/dev/watchfaces/${watchfaceId}/stats?period=${selectedPeriod}`);
      console.log("Stats data:", data);
      console.log("Watchface icon:", data.watchface?.icon);
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  }

  // при первом открытии — грузим за 30 дней
  useEffect(() => {
    loadStats(period);
  }, []);

  // когда кликаем на период — загружаем заново
  function changePeriod(p) {
    setPeriod(p);
    loadStats(p);
  }

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка статистики…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Заголовок с информацией о циферблате */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {stats.watchface?.icon ? (
            <img
              src={stats.watchface.icon}
              alt={stats.watchface.title || "Иконка циферблата"}
              className="w-16 h-16 rounded-xl object-cover border border-white/20 dark:border-gray-700/30 shadow-md"
              onError={(e) => {
                console.error("Failed to load icon:", stats.watchface.icon);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 border border-white/20 dark:border-gray-700/30 shadow-md flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.watchface?.title || "Статистика циферблата"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Аналитика просмотров, кликов, продаж и скачиваний
            </p>
          </div>
        </div>
      </div>

      {/* ПЕРИОДЫ */}
      <div className="mb-6">
        <PeriodSelector period={period} onChange={changePeriod} />
      </div>

      {/* Сводные карточки */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Просмотры" value={stats.views} />
        <StatCard title="Клики" value={stats.clicks} />
        <StatCard title="Покупки" value={stats.sales} />
        <StatCard title="Скачивания" value={stats.downloads || 0} />
        <StatCard
          title="Доход"
          value={`${(stats.revenue || 0).toFixed(2)} ₽`}
        />
        <StatCard
          title="Конверсия"
          value={(stats.conversion * 100).toFixed(1) + "%"}
        />
      </div>

      {/* Рейтинг */}
      {stats.rating !== null && (
        <div className="mb-8 backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <div className="text-gray-600 dark:text-gray-400 text-sm">Рейтинг:</div>
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.rating.toFixed(1)}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                ({stats.rating_count || 0} оценок)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ГРАФИК */}
      <StatsChart chart={stats.chart} />
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon?: React.ReactNode; color?: "blue" | "green" | "purple" | "yellow" }) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
  };

  if (color && colorClasses[color]) {
    return (
      <div className={`border rounded-xl p-6 ${colorClasses[color]}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium opacity-80">{title}</h3>
          {icon && <div className="opacity-60">{icon}</div>}
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 p-4 rounded-xl text-center shadow-md">
      <div className="text-gray-600 dark:text-gray-400 text-sm">{title}</div>
      <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import PeriodSelector from "./PeriodSelector";
import StatsChart from "./StatsChart";

export default function StatsPage({ params }) {
  const watchfaceId = params.id;

  const [period, setPeriod] = useState("30d");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStats(selectedPeriod) {
    setLoading(true);

    const res = await fetch(
      `${API_URL}/dev/watchfaces/${watchfaceId}/stats?period=${selectedPeriod}`,
      { credentials: "include" }
    );

    const data = await res.json();
    setStats(data);
    setLoading(false);
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
      <div className="text-center text-gray-400 py-12">Загрузка статистики…</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Статистика циферблата</h1>

      {/* ПЕРИОДЫ */}
      <PeriodSelector period={period} onChange={changePeriod} />

      {/* КАРТОЧКИ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="Просмотры" value={stats.views} />
        <StatCard title="Клики" value={stats.clicks} />
        <StatCard title="Покупки" value={stats.sales} />
        <StatCard
          title="Конверсия"
          value={(stats.conversion * 100).toFixed(1) + "%"}
        />
      </div>

      {/* ГРАФИК */}
      <StatsChart chart={stats.chart} />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl text-center">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

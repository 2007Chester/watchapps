
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCurrentUser, logout } from "@/lib/auth";

export default function DashboardPage() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => setName(user.name || user.email))
      .catch(() => {
        logout();
      });
  }, []);

  return (
    <main className="min-h-screen flex">
      <aside className="w-64 border-r border-slate-800 p-4 hidden md:block">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">WatchApps Dev</h1>
          <p className="text-xs text-slate-400 mt-1">
            Консоль разработчика
          </p>
        </div>
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard" className="block text-sky-400">
            Обзор
          </Link>
          <Link href="/watchfaces" className="block text-slate-300 hover:text-sky-400">
            Мои циферблаты
          </Link>
          <button
            onClick={logout}
            className="mt-6 text-xs text-slate-500 hover:text-red-400"
          >
            Выйти
          </button>
        </nav>
      </aside>

      <section className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-400">Добро пожаловать</p>
            <h2 className="text-xl font-semibold">
              {name ? name : "Загрузка..."}
            </h2>
          </div>
          <Link href="/watchfaces" className="btn-primary text-xs">
            Перейти к циферблатам
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Циферблаты</p>
            <p className="text-2xl font-semibold">—</p>
            <p className="text-xs text-slate-500 mt-2">
              Здесь скоро появится статистика по твоим циферблатам.
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Продажи</p>
            <p className="text-2xl font-semibold">—</p>
            <p className="text-xs text-slate-500 mt-2">
              Модуль биллинга будет подключён позже.
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400 mb-1">Установки</p>
            <p className="text-2xl font-semibold">—</p>
            <p className="text-xs text-slate-500 mt-2">
              Отчёты по установкам появятся на следующем этапе.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

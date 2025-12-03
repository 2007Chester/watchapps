
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { logout } from "@/lib/auth";

interface WatchfaceFile {
  id: number;
  type: string;
  upload_id: number;
  sort_order: number;
}

interface Watchface {
  id: number;
  title: string;
  slug: string;
  price: number;
  discount_price?: number | null;
  status: string;
  type: string;
  updated_at: string;
  files: WatchfaceFile[];
  is_free?: boolean;
}

interface ListResponse {
  success: boolean;
  items: Watchface[];
}

export default function WatchfacesPage() {
  const [items, setItems] = useState<Watchface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ListResponse>("/dev/watchfaces")
      .then((res) => {
        setItems(res.items || []);
      })
      .catch((err: any) => {
        if (err.message === "Unauthorized") {
          logout();
          return;
        }
        setError(err.message || "Ошибка загрузки");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex">
      <aside className="w-64 border-r border-slate-800 p-4 hidden md:block">
        <div className="mb-8">
          <h1 className="text-lg font-semibold">WatchApps Dev</h1>
        </div>
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard" className="block text-slate-300 hover:text-sky-400">
            Обзор
          </Link>
          <Link href="/watchfaces" className="block text-sky-400">
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
            <h2 className="text-xl font-semibold">Мои циферблаты</h2>
            <p className="text-xs text-slate-400 mt-1">
              Управляй товарами, загружай APK, иконки и скриншоты.
            </p>
          </div>
          <Link href="/watchfaces/create" className="btn-primary text-xs">
            + Новый циферблат
          </Link>
        </div>

        <div className="card">
          {loading && <p className="text-sm text-slate-400">Загрузка...</p>}
          {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-slate-400">
              Пока нет циферблатов. Нажми «Новый циферблат», чтобы создать первый.
            </p>
          )}

          {!loading && !error && items.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Обновлён</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.title}</td>
                    <td className="text-xs text-slate-400">{item.type}</td>
                    <td className="text-sm">
                      {item.is_free ? (
                        "Бесплатно"
                      ) : item.discount_price ? (
                        <>
                          <span className="line-through text-slate-500 mr-1">
                            {item.price}
                          </span>
                          <span className="text-sky-400 font-medium">
                            {item.discount_price}
                          </span>
                        </>
                      ) : (
                        item.price
                      )}
                    </td>
                    <td className="text-xs capitalize text-slate-300">
                      {item.status}
                    </td>
                    <td className="text-xs text-slate-500">
                      {new Date(item.updated_at).toLocaleString()}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/watchfaces/${item.id}`}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        Редактировать
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

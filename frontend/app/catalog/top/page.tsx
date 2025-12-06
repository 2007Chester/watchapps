"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Watchface = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  is_free: boolean;
  type: string;
  icon: string | null;
  banner: string | null;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

export default function TopPage() {
  const router = useRouter();
  const [watchfaces, setWatchfaces] = useState<Watchface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTop();
  }, []);

  async function loadTop() {
    try {
      setLoading(true);
      const data = await apiFetch("/catalog/top");
      setWatchfaces(data || []);
    } catch (err) {
      console.error("Error loading top:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Назад к главной
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Популярные приложения
          </h1>
        </div>

        {watchfaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Пока нет популярных приложений
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchfaces.map((watchface) => (
              <WatchfaceCard key={watchface.id} watchface={watchface} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WatchfaceCard({ watchface }: { watchface: Watchface }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/watchface/${watchface.slug}`)}
      className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {watchface.icon ? (
          <img
            src={watchface.icon}
            alt={watchface.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
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
        {watchface.discount_price && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{Math.round(((watchface.price - watchface.discount_price) / watchface.price) * 100)}%
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {watchface.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {watchface.is_free ? (
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                Бесплатно
              </span>
            ) : watchface.discount_price ? (
              <>
                <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                  {watchface.price} ₽
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {watchface.discount_price} ₽
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {watchface.price} ₽
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


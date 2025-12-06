"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  const [watchfaces, setWatchfaces] = useState<Watchface[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  async function performSearch(searchTerm: string) {
    try {
      setLoading(true);
      const data = await apiFetch(`/catalog/search?q=${encodeURIComponent(searchTerm)}`);
      setWatchfaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error searching:", err);
      setWatchfaces([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Назад к главной
          </Link>
          <form onSubmit={handleSearch} className="relative mt-4">
            <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <svg
                  className="w-5 h-5 text-gray-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск приложений и циферблатов..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="ml-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Найти
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Поиск...</p>
            </div>
          </div>
        ) : query ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Результаты поиска для "{query}"
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Найдено: {watchfaces.length} {watchfaces.length === 1 ? 'приложение' : watchfaces.length < 5 ? 'приложения' : 'приложений'}
              </p>
            </div>

            {watchfaces.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  По запросу "{query}" ничего не найдено
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchfaces.map((watchface) => (
                  <WatchfaceCard key={watchface.id} watchface={watchface} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Введите запрос для поиска
            </p>
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
      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800 p-3">
        {watchface.icon ? (
          <img
            src={watchface.icon}
            alt={watchface.title}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
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


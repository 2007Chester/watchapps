"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
};

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

type CategoryWithWatchfaces = Category & {
  watchfaces: Watchface[];
};

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithWatchfaces, setCategoriesWithWatchfaces] = useState<CategoryWithWatchfaces[]>([]);
  const [topWatchfaces, setTopWatchfaces] = useState<Watchface[]>([]);
  const [newWatchfaces, setNewWatchfaces] = useState<Watchface[]>([]);
  const [discountWatchfaces, setDiscountWatchfaces] = useState<Watchface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [categoriesData, topData, newData, discountsData] = await Promise.all([
        apiFetch("/catalog/categories"),
        apiFetch("/catalog/top"),
        apiFetch("/catalog/new"),
        apiFetch("/catalog/discounts"),
      ]);

      setCategories(categoriesData || []);
      setTopWatchfaces(topData || []);
      setNewWatchfaces(newData || []);
      setDiscountWatchfaces(discountsData || []);

      // Загружаем приложения для каждой категории
      if (categoriesData && categoriesData.length > 0) {
        const categoryPromises = categoriesData.map(async (category: Category) => {
          try {
            const watchfaces = await apiFetch(`/catalog/category/${category.slug}`);
            const watchfacesArray = Array.isArray(watchfaces) ? watchfaces : [];
            return {
              ...category,
              watchfaces: watchfacesArray,
            };
          } catch (err) {
            console.error(`Error loading category ${category.slug}:`, err);
            return {
              ...category,
              watchfaces: [],
            };
          }
        });

        const categoriesWithData = await Promise.all(categoryPromises);
        // Фильтруем категории без циферблатов
        const filteredCategories = categoriesWithData.filter(cat => cat.watchfaces && cat.watchfaces.length > 0);
        console.log('Categories with watchfaces:', filteredCategories);
        setCategoriesWithWatchfaces(filteredCategories);
      }
    } catch (err) {
      console.error("Error loading data:", err);
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
    <div className="min-h-screen pt-4">
      {/* Search Section */}
      <section className="my-4 mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Top Watchfaces */}
      {topWatchfaces.length > 0 && (
        <section className="my-4 mx-4 sm:mx-6 lg:mx-8 backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Популярные
              </h2>
              <Link
                href="/catalog/top"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Смотреть все →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 -m-1">
              {topWatchfaces.slice(0, 10).map((watchface) => (
                <div key={watchface.id} className="m-0.5">
                  <WatchfaceCard watchface={watchface} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Watchfaces */}
      {newWatchfaces.length > 0 && (
        <section className="my-4 mx-4 sm:mx-6 lg:mx-8 backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Новинки
              </h2>
              <Link
                href="/catalog/new"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Смотреть все →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 -m-1">
              {newWatchfaces.slice(0, 10).map((watchface) => (
                <div key={watchface.id} className="m-0.5">
                  <WatchfaceCard watchface={watchface} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Sections */}
      {categoriesWithWatchfaces.length > 0 && categoriesWithWatchfaces.map((category) => {
        // Дополнительная проверка на случай, если что-то пошло не так
        if (!category.watchfaces || category.watchfaces.length === 0) {
          return null;
        }
        
        return (
          <section key={category.id} className="my-4 mx-4 sm:mx-6 lg:mx-8 backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Смотреть все →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 -m-1">
                {category.watchfaces.slice(0, 10).map((watchface) => (
                  <div key={watchface.id} className="m-0.5">
                    <WatchfaceCard watchface={watchface} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Discounts */}
      {discountWatchfaces.length > 0 && (
        <section className="my-4 mx-4 sm:mx-6 lg:mx-8 backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Скидки
              </h2>
              <Link
                href="/catalog/discounts"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Смотреть все →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 -m-1">
              {discountWatchfaces.slice(0, 10).map((watchface) => (
                <div key={watchface.id} className="m-0.5">
                  <WatchfaceCard watchface={watchface} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function WatchfaceCard({ watchface }: { watchface: Watchface }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/watchface/${watchface.slug}`)}
      className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[0.85] cursor-pointer group scale-[0.77]"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
        {watchface.icon ? (
          <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden">
            <img
              src={watchface.icon}
              alt={watchface.title}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 rounded-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-gray-400"
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
          <div className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
            -{Math.round(((watchface.price - watchface.discount_price) / watchface.price) * 100)}%
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-[17px] font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
          {watchface.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {watchface.is_free ? (
              <span className="text-[17px] font-bold text-green-600 dark:text-green-400">
                Бесплатно
              </span>
            ) : watchface.discount_price ? (
              <>
                <span className="text-[14px] text-gray-500 dark:text-gray-400 line-through">
                  {watchface.price} ₽
                </span>
                <span className="text-[17px] font-bold text-gray-900 dark:text-white">
                  {watchface.discount_price} ₽
                </span>
              </>
            ) : (
              <span className="text-[17px] font-bold text-gray-900 dark:text-white">
                {watchface.price} ₽
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 rounded-2xl overflow-hidden">
        <div className="flex items-center px-3 py-2">
          <svg
            className="w-4 h-4 text-gray-400 mr-2"
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
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="ml-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Найти
          </button>
        </div>
      </div>
    </form>
  );
}

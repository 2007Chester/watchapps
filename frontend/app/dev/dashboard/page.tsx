"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Watchface = {
  id: number;
  title: string;
  slug: string;
  price: number;
  is_free: boolean;
  status: string;
  type: string;
  files?: Array<{
    type: string;
    url?: string;
    upload?: {
      url?: string;
      filename?: string;
    };
  }>;
};

export default function DevDashboardPage() {
  const router = useRouter();
  const [watchfaces, setWatchfaces] = useState<Watchface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWatchfaces() {
      try {
        const data = await apiFetch("/dev/watchfaces");
        // API может возвращать либо { items: [...] }, либо { watchfaces: [...] }
        const items = data.items || data.watchfaces || [];
        setWatchfaces(items);
      } catch (err: any) {
        console.error("Error loading watchfaces:", err);
        setError(err.message || "Ошибка загрузки циферблатов");
      } finally {
        setLoading(false);
      }
    }

    loadWatchfaces();
  }, []);

  const getIconUrl = (watchface: Watchface): string => {
    const iconFile = watchface.files?.find((f) => f.type === "icon");
    // Проверяем разные варианты структуры данных
    if (iconFile) {
      // Если есть url напрямую (из accessor модели)
      if (iconFile.url) {
        return iconFile.url;
      }
      // Если есть upload с url
      if (iconFile.upload?.url) {
        return iconFile.upload.url;
      }
      // Если есть upload с filename, формируем URL
      if (iconFile.upload?.filename) {
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : 'https://dev.watchapps.ru';
        return `${baseUrl}/storage/uploads/${iconFile.upload.filename}`;
      }
    }
    return "/placeholder_icon.png";
  };

  const formatPrice = (watchface: Watchface): string => {
    if (watchface.is_free) return "Бесплатно";
    return `${watchface.price} ₽`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            Опубликован
          </span>
        );
      case "draft":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
            Черновик
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  const getTypeLabel = (type: string): string => {
    return type === "app" ? "Приложение" : "Циферблат";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Мои приложения и циферблаты
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Управляйте своими приложениями и циферблатами для Wear OS
            </p>
          </div>
          {/* Кнопка добавления приложения - показывается только если есть хотя бы одно приложение */}
          {watchfaces.length > 0 && (
            <Link
              href="/dev/watchfaces/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-lg hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Добавить приложение</span>
            </Link>
          )}
        </div>
      </div>

      {/* Пустое состояние */}
      {watchfaces.length === 0 && (
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl p-12 text-center shadow-2xl shadow-black/10 dark:shadow-black/30">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              У вас пока нет приложений
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Добавьте свое первое приложение или циферблат для Wear OS
            </p>
            <Link
              href="/dev/watchfaces/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-full hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span>+</span>
              <span>Добавить первое приложение</span>
            </Link>
          </div>
        </div>
      )}

      {/* Список приложений */}
      {watchfaces.length > 0 && (
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {watchfaces.map((watchface) => (
              <button
                key={watchface.id}
                onClick={() => router.push(`/dev/watchfaces/${watchface.id}/edit`)}
                className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  {/* Иконка */}
                  <div className="flex-shrink-0">
                    <img
                      src={getIconUrl(watchface)}
                      alt={watchface.title}
                      className="w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder_icon.png";
                      }}
                    />
                  </div>

                  {/* Информация */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {watchface.title}
                          </h3>
                          {getStatusBadge(watchface.status)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {getTypeLabel(watchface.type)}
                        </p>
                        <div className="flex items-center gap-4">
                          {/* Цена */}
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {formatPrice(watchface)}
                          </span>
                          {/* Рейтинг (заглушка) */}
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              0.0
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              (0)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Стрелка */}
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

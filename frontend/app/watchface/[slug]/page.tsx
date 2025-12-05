"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

// Тип для watchface
type Watchface = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  is_free: boolean;
  version: string | null;
  min_sdk: number | null;
  target_sdk: number | null;
  max_sdk: number | null;
  wear_os_version: string | null;
  type: "watchface" | "app";
  status: string;
  files?: Array<{
    id: number;
    type: string;
    url: string;
    upload?: {
      url: string;
      original_name: string;
    };
  }>;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

// Простое модальное окно, которое показываем, если пользователь не залогинен.
function LoginRequiredModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-white">
          Войдите, чтобы купить циферблат
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Для покупки и установки циферблата необходимо войти в аккаунт или
          зарегистрироваться.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
            onClick={() => {
              router.push("/login");
            }}
          >
            Войти
          </button>
          <button
            className="w-full rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:border-gray-400"
            onClick={() => {
              router.push("/register");
            }}
          >
            Регистрация
          </button>
        </div>

        <button
          className="mt-3 w-full text-center text-xs text-gray-500 hover:text-gray-300"
          onClick={onClose}
        >
          Отменить
        </button>
      </div>
    </div>
  );
}

export default function WatchfacePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [watchface, setWatchface] = useState<Watchface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: заменить на реальное состояние авторизации (token/role из useAuth)
  const isLoggedIn = false;

  useEffect(() => {
    async function fetchWatchface() {
      try {
        setLoading(true);
        const data = await apiFetch(`/watchface/${slug}`);
        setWatchface(data);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchWatchface();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error || !watchface) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">{error || "Приложение не найдено"}</div>
      </div>
    );
  }

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      // Пользователь не авторизован – показываем окно
      setShowLoginModal(true);
      return;
    }

    // Если авторизован – перенаправляем на страницу покупки
    // TODO: сделать реальный маршрут покупки /purchase/[slug]
    // router.push(`/purchase/${slug}`);
  };

  return (
    <div className="space-y-6">
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Хлебные крошки */}
      <div className="text-xs text-gray-400">
        <Link href="/catalog" className="hover:text-gray-200">
          Каталог
        </Link>{" "}
        / <span className="text-gray-300">{watchface.title}</span>
      </div>

      {/* Основной блок: слева превью, справа информация */}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          {(() => {
            // Ищем banner или icon для отображения
            const banner = watchface.files?.find(f => f.type === 'banner');
            const icon = watchface.files?.find(f => f.type === 'icon');
            const imageUrl = banner?.url || icon?.url || banner?.upload?.url || icon?.upload?.url;
            
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={watchface.title}
                className="aspect-square w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-gray-700 to-black" />
            );
          })()}
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold">{watchface.title}</h1>

          <p className="text-sm text-gray-300">{watchface.description}</p>

          {/* Информация о версии и совместимости */}
          {(watchface.version || watchface.wear_os_version || watchface.min_sdk !== null) && (
            <div className="mt-3 space-y-2 rounded-xl border border-gray-700/50 bg-gray-800/30 p-4">
              <h3 className="text-sm font-semibold text-gray-300">Информация о приложении</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {watchface.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Версия:</span>
                    <span className="font-semibold text-white">{watchface.version}</span>
                  </div>
                )}
                {watchface.wear_os_version && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Wear OS:</span>
                    <span className="font-semibold text-white">{watchface.wear_os_version}</span>
                  </div>
                )}
                {watchface.min_sdk !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Min SDK:</span>
                    <span className="font-semibold text-white">{watchface.min_sdk}</span>
                  </div>
                )}
                {watchface.target_sdk !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Target SDK:</span>
                    <span className="font-semibold text-white">{watchface.target_sdk}</span>
                  </div>
                )}
                {watchface.max_sdk !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Max SDK:</span>
                    <span className="font-semibold text-white">{watchface.max_sdk}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Цена */}
          <div className="mt-3 flex items-baseline gap-2">
            {watchface.is_free ? (
              <span className="text-2xl font-bold text-green-400">Бесплатно</span>
            ) : (
              <>
                {watchface.discount_price && watchface.discount_price < watchface.price ? (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {watchface.price} ₽
                    </span>
                    <span className="text-2xl font-bold text-green-400">
                      {watchface.discount_price} ₽
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-green-400">
                    {watchface.price} ₽
                  </span>
                )}
              </>
            )}
          </div>

          {/* Кнопки */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
              onClick={handleBuyClick}
            >
              Купить и установить
            </button>
            <button className="flex-1 rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:border-gray-400">
              Добавить в избранное
            </button>
          </div>

          {/* Доп. инфо: теги/фичи – пока статично */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
            <span className="rounded-full border border-gray-700 px-2 py-1">
              Analog
            </span>
            <span className="rounded-full border border-gray-700 px-2 py-1">
              AOD
            </span>
            <span className="rounded-full border border-gray-700 px-2 py-1">
              Complications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

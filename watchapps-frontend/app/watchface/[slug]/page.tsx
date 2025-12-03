"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Тип для простого демо-товара
type Watchface = {
  title: string;
  price: number;
  description: string;
};

function useFakeWatchface(slug: string): Watchface {
  // ВРЕМЕННО: заглушка. Потом заменим на реальный fetch к backend.
  return {
    title: `Demo Watchface (${slug})`,
    price: 199,
    description:
      "Премиальный аналоговый циферблат для Wear OS с поддержкой AOD, осложнений и кастомизации.",
  };
}

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

  // TODO: заменить на реальное состояние авторизации (token/role из useAuth)
  const isLoggedIn = false;

  const watchface = useFakeWatchface(slug);

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
          <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-gray-700 to-black" />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold">{watchface.title}</h1>

          <p className="text-sm text-gray-300">{watchface.description}</p>

          {/* Цена */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-400">
              {watchface.price} ₽
            </span>
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

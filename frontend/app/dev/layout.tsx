"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Пути, где НЕ нужна авторизация
  const publicPaths = [
    "/dev",
    "/dev/login",
    "/dev/register",
    "/dev/forgot-password",
    "/dev/reset-password",
    "/dev/verify",
    "/dev/verify/",
    "/dev/verify-email",
    "/verify-email", // Страница подтверждения email (может быть без /dev префикса)
  ];

  // Если путь публичный → просто рендерим без проверки
  if (publicPaths.includes(pathname)) {
    return (
      <div className="py-4">
        {children}
      </div>
    );
  }

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUser() {
      // Проверяем наличие токена перед запросом
      const token = typeof window !== 'undefined' ? localStorage.getItem("wa_token") : null;
      if (!token) {
        console.error("No token found in localStorage");
        window.location.href = "/dev/login";
        return;
      }

      try {
        const u = await apiFetch("/auth/user");
        if (!u) {
          console.error("No user data received");
          setLoading(false);
          window.location.href = "/dev/login";
          return;
        }
        setUser(u);
        setLoading(false);
      } catch (error) {
        console.error("Error loading user:", error);
        setLoading(false);
        // Редиректим на логин только если это не публичная страница
        if (!publicPaths.includes(pathname || "")) {
          window.location.href = "/dev/login";
        }
        return;
      }
    }

    loadUser();

    // Слушаем событие обновления данных пользователя (например, после подтверждения email)
    const handleUserUpdate = () => {
      console.log("User data update event received in dev layout, reloading user");
      loadUser();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("userDataUpdated", handleUserUpdate);
      return () => {
        window.removeEventListener("userDataUpdated", handleUserUpdate);
      };
    }
  }, []);

  async function resendEmail() {
    setResending(true);
    setMessage("");

    try {
      await apiFetch("/auth/send-verification", { method: "POST" });
      setMessage("Письмо отправлено!");
    } catch {
      setMessage("Ошибка отправки письма.");
    }

    setResending(false);
  }

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400 p-8">Загрузка…</div>;
  }

  // Если пользователь не загружен и это не публичная страница, не показываем контент
  if (!user && !publicPaths.includes(pathname || "")) {
    return <div className="text-gray-600 dark:text-gray-400 p-8">Перенаправление на страницу входа…</div>;
  }

  // Не показываем предупреждение о верификации, если пользователь на странице подтверждения
  const isVerificationPage = pathname === "/verify-email" || pathname?.includes("/verify");

  // Определяем активный путь для подсветки в меню
  const isActive = (path: string) => {
    if (path === "/dev/dashboard" || path === "/dev") {
      return pathname === "/dev/dashboard" || pathname === "/dev";
    }
    return pathname?.startsWith(path);
  };

  return (
    <>
      {user && !user.verified && !isVerificationPage && (
        <div className="bg-yellow-50 dark:bg-yellow-500/20 border-b border-yellow-200 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200 px-6 py-4 text-sm text-center">
          <p className="font-semibold mb-2">
            Подтвердите email, чтобы продолжить работу в Dev Console
          </p>
          <button
            onClick={resendEmail}
            disabled={resending}
            className="bg-yellow-500 dark:bg-yellow-500 text-black dark:text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Отправляем…" : "Отправить письмо повторно"}
          </button>

          {message && (
            <p className={`mt-2 ${message.includes("Ошибка") ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
              {message}
            </p>
          )}
        </div>
      )}
      
      {/* Навигационное меню */}
      {user && !publicPaths.includes(pathname || "") && (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <Link
                href="/dev/dashboard"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive("/dev/dashboard")
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Приложения
              </Link>
              <Link
                href="/dev/statistics"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive("/dev/statistics")
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Статистика
              </Link>
              <Link
                href="/dev/reviews"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive("/dev/reviews")
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Отзывы
              </Link>
            </div>
          </div>
        </nav>
      )}
      
      <div className="p-6">{children}</div>
    </>
  );
}

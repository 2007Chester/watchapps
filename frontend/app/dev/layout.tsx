"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { usePathname } from "next/navigation";

export default function DevLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Пути, где НЕ нужна авторизация
  const publicPaths = [
    "/dev/login",
    "/dev/register",
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
          window.location.href = "/dev/login";
          return;
        }
        setUser(u);
      } catch (error) {
        console.error("Error loading user:", error);
        // Не редиректим сразу, даём пользователю увидеть ошибку
        setLoading(false);
        return;
      }
      setLoading(false);
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

  // Не показываем предупреждение о верификации, если пользователь на странице подтверждения
  const isVerificationPage = pathname === "/verify-email" || pathname?.includes("/verify");

  return (
    <>
      {!user.verified && !isVerificationPage && (
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
      <div className="p-6">{children}</div>
    </>
  );
}

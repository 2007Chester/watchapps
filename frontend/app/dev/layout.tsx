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
  ];

  // Если путь публичный → просто рендерим без проверки
  if (publicPaths.includes(pathname)) {
    return (
      <div className="min-h-screen bg-[#05060A] p-6">
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
    return <div className="text-white/80 p-8">Загрузка…</div>;
  }

  return (
    <div className="min-h-screen bg-[#05060A]">
      {!user.verified && (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-6 py-4 text-sm text-center">
          <p className="font-semibold mb-2">
            Подтвердите email, чтобы продолжить работу в Dev Console
          </p>
          <button
            onClick={resendEmail}
            disabled={resending}
            className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition active:scale-95"
          >
            {resending ? "Отправляем…" : "Отправить письмо повторно"}
          </button>

          {message && (
            <p className="mt-2 text-yellow-300">{message}</p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

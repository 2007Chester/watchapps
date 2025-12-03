"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const success = params.get("success");
  const error = params.get("error");
  const redirectUrl = params.get("redirect");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_verified" | "invalid" | "expired">("loading");

  useEffect(() => {
    // Если есть параметры из редиректа с бэкенда
    if (success === "true") {
      setStatus("success");
      
      // Обновляем данные пользователя на фронтенде
      window.dispatchEvent(new CustomEvent("userDataUpdated"));
      
      // Дополнительно обновляем данные пользователя через API
      const updateUserData = async () => {
        try {
          const isDev = window.location.hostname === "dev.watchapps.ru";
          const apiBase = isDev ? "https://dev.watchapps.ru" : "https://watchapps.ru";
          await fetch(`${apiBase}/api/auth/user`, {
            credentials: "include",
          });
          // Еще раз отправляем событие обновления
          window.dispatchEvent(new CustomEvent("userDataUpdated"));
        } catch (e) {
          console.error("Error refreshing user data:", e);
        }
      };
      
      updateUserData();
      
      // Редирект через 1.5 секунды (даем время на обновление данных)
      // Используем window.location.href для полной перезагрузки страницы с обновленными данными
      setTimeout(() => {
        // Еще раз обновляем данные перед редиректом
        window.dispatchEvent(new CustomEvent("userDataUpdated"));
        
        setTimeout(() => {
          if (redirectUrl) {
            window.location.href = decodeURIComponent(redirectUrl);
          } else {
            const isDev = window.location.hostname === "dev.watchapps.ru";
            window.location.href = isDev ? "/dev/dashboard" : "/";
          }
        }, 500);
      }, 1500);
      return;
    }

    if (success === "already_verified") {
      setStatus("already_verified");
      return;
    }

    if (error === "invalid_token") {
      setStatus("invalid");
      return;
    }

    if (error === "expired_token") {
      setStatus("expired");
      return;
    }

    // Если есть токен в URL, обрабатываем его
    if (token) {
      verifyToken(token);
    } else {
      setStatus("invalid");
    }
  }, [token, success, error, redirectUrl, router]);

  async function verifyToken(token: string) {
    try {
      // Определяем API URL
      const isDev = window.location.hostname === "dev.watchapps.ru";
      const apiBase = isDev ? "https://dev.watchapps.ru" : "https://watchapps.ru";
      
      const response = await fetch(`${apiBase}/api/auth/verify/${token}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok || response.redirected) {
        // Если редирект, значит бэкенд обработал успешно
        setStatus("success");
        
        // Обновляем данные пользователя на фронтенде
        window.dispatchEvent(new CustomEvent("userDataUpdated"));
        
        // Даем время на обновление данных пользователя перед редиректом
        setTimeout(async () => {
          // Дополнительно обновляем данные пользователя через API
          try {
            const isDev = window.location.hostname === "dev.watchapps.ru";
            const apiBase = isDev ? "https://dev.watchapps.ru" : "https://watchapps.ru";
            await fetch(`${apiBase}/api/auth/user`, {
              credentials: "include",
            });
            // Еще раз отправляем событие обновления
            window.dispatchEvent(new CustomEvent("userDataUpdated"));
          } catch (e) {
            console.error("Error refreshing user data:", e);
          }
          
          // Редирект после небольшой задержки
          // Используем window.location.href для полной перезагрузки страницы с обновленными данными
          setTimeout(() => {
            window.location.href = isDev ? "/dev/dashboard" : "/";
          }, 500);
        }, 1500);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 rounded-3xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Подтверждение email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Подтверждаем ваш email адрес…
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Email подтверждён!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ваш email адрес успешно подтверждён. Вы будете перенаправлены...
            </p>
            <Link
              href={typeof window !== "undefined" && window.location.hostname === "dev.watchapps.ru" ? "/dev/dashboard" : "/"}
              className="inline-block backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 transition-all"
            >
              Перейти на главную
            </Link>
          </div>
        )}

        {status === "already_verified" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Email уже подтверждён
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ваш email адрес уже был подтверждён ранее.
            </p>
            <Link
              href={typeof window !== "undefined" && window.location.hostname === "dev.watchapps.ru" ? "/dev/dashboard" : "/"}
              className="inline-block backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 transition-all"
            >
              Перейти на главную
            </Link>
          </div>
        )}

        {(status === "invalid" || status === "expired") && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {status === "expired" ? "Ссылка истекла" : "Неверная ссылка"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {status === "expired" 
                ? "Ссылка для подтверждения email истекла. Пожалуйста, запросите новую ссылку."
                : "Ссылка для подтверждения email недействительна. Пожалуйста, запросите новую ссылку."}
            </p>
            <Link
              href="/verify/send"
              className="inline-block backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 transition-all"
            >
              Отправить новое письмо
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Ошибка подтверждения
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Произошла ошибка при подтверждении email. Пожалуйста, попробуйте ещё раз.
            </p>
            <Link
              href="/verify/send"
              className="inline-block backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 transition-all"
            >
              Отправить новое письмо
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

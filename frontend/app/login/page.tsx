"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function LoginUserPage() {
  const requiredRole = "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    async function checkAuth() {
      const token = typeof window !== 'undefined' ? localStorage.getItem("wa_token") : null;
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const user = await apiFetch("/auth/user");
        if (user) {
          // Если пользователь авторизован, редиректим на главную
          window.location.href = "/";
        }
      } catch (error) {
        // Если ошибка, значит не авторизован - продолжаем показывать форму входа
        console.log("User not authenticated");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  async function login() {
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res?.user) {
        setError("Неверный email или пароль.");
        setLoading(false);
        return;
      }

      const roles = res.user.roles || [];
      if (!roles.includes(requiredRole)) {
        setError("Этот аккаунт не является пользовательским.");
        setLoading(false);
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Ошибка соединения.");
    }

    setLoading(false);
  }

  if (checkingAuth) {
    return (
      <div className="flex justify-center py-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Проверка авторизации...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">

        <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-6 font-semibold">
          Вход в аккаунт
        </h1>

        {/* EMAIL */}
        <label className="text-gray-700 dark:text-gray-300 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-1 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />

        {/* PASSWORD */}
        <div className="mt-4">
          <label className="text-gray-700 dark:text-gray-300 text-sm">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              className="mt-1 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm text-center mt-4">{error}</p>
        )}

        {/* SUBMIT */}
        <button
          onClick={login}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all ${
            loading
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg"
          }`}
        >
          {loading ? "Входим…" : "Войти"}
        </button>

        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mt-4">
          Нет аккаунта?{" "}
          <a href="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors">
            Создать аккаунт
          </a>
        </p>
      </div>
    </div>
  );
}

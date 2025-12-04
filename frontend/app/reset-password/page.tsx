"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setError("Неверная ссылка для восстановления пароля.");
    }
  }, [token, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Неверная ссылка для восстановления пароля.");
      return;
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов.");
      return;
    }

    if (password !== password2) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: password2,
        }),
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ошибка сброса пароля.");
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-3xl p-8 shadow-xl shadow-black/10 dark:shadow-black/30">
            <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-6 font-semibold">
              Ошибка
            </h1>
            <p className="text-red-600 dark:text-red-400 text-sm text-center mb-4">
              Неверная ссылка для восстановления пароля.
            </p>
            <a
              href="/forgot-password"
              className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm underline transition-colors"
            >
              Запросить новую ссылку
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-3xl p-8 shadow-xl shadow-black/10 dark:shadow-black/30">
            <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-2 font-semibold">
              Пароль изменен
            </h1>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm text-center mb-6">
              Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.
            </p>
            <a
              href="/login"
              className="block w-full text-center py-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-semibold active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 transition-all"
            >
              Войти
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-3xl p-8 shadow-xl shadow-black/10 dark:shadow-black/30">
          <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-2 font-semibold">
            Новый пароль
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
            Введите новый пароль для вашего аккаунта
          </p>

          <form onSubmit={handleSubmit}>
            {/* PASSWORD */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm">Новый пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  className="mt-1 w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-white/30 dark:border-gray-700/30 rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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

            {/* PASSWORD CONFIRM */}
            <div className="mt-4">
              <label className="text-gray-700 dark:text-gray-300 text-sm">Подтверждение пароля</label>
              <div className="relative">
                <input
                  type={showPassword2 ? "text" : "password"}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  minLength={6}
                  className="mt-1 w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-white/30 dark:border-gray-700/30 rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {showPassword2 ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm text-center mt-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== password2}
              className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all ${
                loading || password.length < 6 || password !== password2
                  ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                  : "backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20"
              }`}
            >
              {loading ? "Изменяем пароль…" : "Изменить пароль"}
            </button>

            <div className="mt-4 text-center">
              <a
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm underline transition-colors"
              >
                Вернуться к входу
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


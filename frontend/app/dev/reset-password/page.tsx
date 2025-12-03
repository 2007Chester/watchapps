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
      <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
        <div className="max-w-md w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl text-white text-center mb-6 font-semibold">
            Ошибка
          </h1>
          <p className="text-red-400 text-sm text-center mb-4">
            Неверная ссылка для восстановления пароля.
          </p>
          <a
            href="/dev/forgot-password"
            className="block text-center text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Запросить новую ссылку
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
        <div className="max-w-md w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl text-white text-center mb-2 font-semibold">
            Пароль изменен
          </h1>
          <p className="text-emerald-400 text-sm text-center mb-6">
            Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.
          </p>
          <a
            href="/dev/login"
            className="block w-full text-center py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 active:scale-95 transition"
          >
            Войти
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
      <div className="max-w-md w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl text-white text-center mb-2 font-semibold">
          Новый пароль
        </h1>
        <p className="text-white/60 text-sm text-center mb-6">
          Введите новый пароль для вашего аккаунта
        </p>

        <form onSubmit={handleSubmit}>
          {/* PASSWORD */}
          <div>
            <label className="text-white/60 text-sm">Новый пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* PASSWORD CONFIRM */}
          <div className="mt-4">
            <label className="text-white/60 text-sm">Подтверждение пароля</label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Повторите пароль"
                required
                minLength={6}
                className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 pr-12 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
              >
                {showPassword2 ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || password.length < 6 || password !== password2}
            className={`mt-6 w-full py-3 rounded-xl text-white font-semibold ${
              loading || password.length < 6 || password !== password2
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 active:scale-95"
            }`}
          >
            {loading ? "Изменяем пароль…" : "Изменить пароль"}
          </button>

          <div className="mt-4 text-center">
            <a
              href="/dev/login"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Вернуться к входу
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}




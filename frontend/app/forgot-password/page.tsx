"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ошибка отправки запроса.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-3xl p-8 shadow-xl shadow-black/10 dark:shadow-black/30">
          <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-2 font-semibold">
            Восстановление пароля
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
            Введите email, и мы отправим вам ссылку для восстановления пароля
          </p>

          {success ? (
            <div className="text-center">
              <p className="text-emerald-600 dark:text-emerald-400 text-sm mb-4">
                Если email существует, на него будет отправлена ссылка для восстановления пароля.
              </p>
              <a
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm underline transition-colors"
              >
                Вернуться к входу
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="text-gray-700 dark:text-gray-300 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="mt-1 w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-white/30 dark:border-gray-700/30 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />

              {error && (
                <p className="text-red-600 dark:text-red-400 text-sm text-center mt-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all ${
                  loading || !email
                    ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                    : "backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20"
                }`}
              >
                {loading ? "Отправляем…" : "Отправить ссылку"}
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
          )}
        </div>
      </div>
    </div>
  );
}


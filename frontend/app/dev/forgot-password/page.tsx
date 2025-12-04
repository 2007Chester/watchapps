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
    <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
      <div className="max-w-md w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl text-white text-center mb-2 font-semibold">
          Восстановление пароля
        </h1>
        <p className="text-white/60 text-sm text-center mb-6">
          Введите email, и мы отправим вам ссылку для восстановления пароля
        </p>

        {success ? (
          <div className="text-center">
            <p className="text-emerald-400 text-sm mb-4">
              Если email существует, на него будет отправлена ссылка для восстановления пароля.
            </p>
            <a
              href="/dev/login"
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Вернуться к входу
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="text-white/60 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dev@example.com"
              required
              className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />

            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className={`mt-6 w-full py-3 rounded-xl text-white font-semibold ${
                loading || !email
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 active:scale-95"
              }`}
            >
              {loading ? "Отправляем…" : "Отправить ссылку"}
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
        )}
      </div>
    </div>
  );
}




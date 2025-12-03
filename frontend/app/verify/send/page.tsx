"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function VerifySendPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function resend() {
    setLoading(true);
    setMessage("");

    try {
      await apiFetch("/auth/send-verification", {
        method: "POST",
      });

      setMessage("Письмо отправлено повторно!");
    } catch (e: any) {
      setMessage("Ошибка при отправке письма.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 rounded-3xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30 max-w-md w-full">

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-4">
          Подтвердите email
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
          Мы отправили письмо для подтверждения email.
          Проверьте почту и перейдите по ссылке.
        </p>

        <button
          onClick={resend}
          disabled={loading}
          className="w-full py-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white font-semibold active:scale-95 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Отправляем…" : "Отправить письмо ещё раз"}
        </button>

        {message && (
          <p className={`text-center text-sm mt-4 ${
            message.includes("Ошибка") 
              ? "text-red-600 dark:text-red-400" 
              : "text-green-600 dark:text-green-400"
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#05060A] flex items-center justify-center px-4">
      <div className="bg-[#151823] p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-xl">

        <h1 className="text-2xl font-semibold text-white text-center mb-4">
          Подтвердите email
        </h1>

        <p className="text-white/60 text-sm text-center mb-6">
          Мы отправили письмо для подтверждения email.
          Проверьте почту и перейдите по ссылке.
        </p>

        <button
          onClick={resend}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 active:scale-95 transition"
        >
          {loading ? "Отправляем…" : "Отправить письмо ещё раз"}
        </button>

        {message && (
          <p className="text-center text-emerald-400 text-sm mt-4">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

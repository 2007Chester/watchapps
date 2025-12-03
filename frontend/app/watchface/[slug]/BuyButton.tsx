"use client";

import { API_URL } from "@/lib/api";
import { useState } from "react";

export default function BuyButton({ watchfaceId }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);

    // Здесь будет платеж (Stripe/YooKassa/Google Play)
    // Сейчас имитируем успех
    const paymentSuccess = true;

    if (paymentSuccess) {
      // Записываем покупку
      await fetch(`${API_URL}/purchase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchface_id: watchfaceId }),
      });

      alert("Покупка успешно завершена!");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-xl font-semibold"
    >
      {loading ? "Покупаю..." : "Купить"}
    </button>
  );
}

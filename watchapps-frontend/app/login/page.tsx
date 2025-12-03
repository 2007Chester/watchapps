"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function LoginUserPage() {
  const requiredRole = "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
      <div className="max-w-md w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">

        <h1 className="text-3xl text-white text-center mb-6 font-semibold">
          Вход в аккаунт
        </h1>

        {/* EMAIL */}
        <label className="text-white/60 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="mt-1 w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* PASSWORD */}
        <div className="mt-4">
          <label className="text-white/60 text-sm">Пароль</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
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

        {error && (
          <p className="text-red-400 text-sm text-center mt-4">{error}</p>
        )}

        {/* SUBMIT */}
        <button
          onClick={login}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold ${
            loading
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 active:scale-95"
          }`}
        >
          {loading ? "Входим…" : "Войти"}
        </button>

        <p className="text-white/40 text-sm text-center mt-4">
          Нет аккаунта?{" "}
          <a href="/register" className="text-blue-400 underline">
            Создать аккаунт
          </a>
        </p>
      </div>
    </div>
  );
}

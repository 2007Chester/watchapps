"use server";

import { API_URL } from "@/lib/api";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // 1. Получаем CSRF cookie (без /api, так как это не API route)
  const baseUrl = API_URL.replace('/api', '');
  await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });

  // 2. Выполняем POST /auth/login
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Неверный email или пароль");
  }

  // Laravel вернёт cookie автоматически (httpOnly)
  return { success: true };
}

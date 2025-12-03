"use server";

import { API_URL } from "@/lib/api";
import { redirect } from "next/navigation";

export async function registerAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  // Sanctum CSRF cookie (без /api, так как это не API route)
  const baseUrl = API_URL.replace('/api', '');
  await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    throw new Error("Ошибка при регистрации");
  }

  redirect("/");
}

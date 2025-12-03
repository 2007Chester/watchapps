"use server";

import { API_URL } from "@/lib/api";
import { redirect } from "next/navigation";

export async function createWatchfaceAction(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const price = formData.get("price");
  const category = formData.get("category");
  const description = formData.get("description");

  const res = await fetch(`${API_URL}/dev/watchfaces`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      slug,
      price,
      category,
      description,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Ошибка при создании циферблата");
  }

  return await res.json();
}

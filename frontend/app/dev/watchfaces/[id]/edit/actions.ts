"use server";

import { API_URL } from "@/lib/api";
import { redirect } from "next/navigation";

// Загрузка файлов (apk, icon, banner, screenshot)
export async function uploadFileAction(id: string, formData: FormData) {
  const res = await fetch(`${API_URL}/dev/watchfaces/${id}/files`, {
    method: "POST",
    credentials: "include",
    body: formData, // multipart/form-data (важно!)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Ошибка загрузки файла");
  }

  return await res.json();
}

// Удалить файл
export async function deleteFileAction(watchfaceId: string, fileId: string) {
  const res = await fetch(
    `${API_URL}/dev/watchfaces/${watchfaceId}/files/${fileId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!res.ok) throw new Error("Ошибка удаления файла");
}

// Обновить текстовые поля
export async function updateInfoAction(id: string, formData: FormData) {
  const payload = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    price: formData.get("price"),
    category: formData.get("category"),
    description: formData.get("description"),
  };

  const res = await fetch(`${API_URL}/dev/watchfaces/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Ошибка обновления");
  }
}

// Publish / Unpublish
export async function publishAction(id: string) {
  await fetch(`${API_URL}/dev/watchfaces/${id}/publish`, {
    method: "POST",
    credentials: "include",
  });
}

export async function unpublishAction(id: string) {
  await fetch(`${API_URL}/dev/watchfaces/${id}/unpublish`, {
    method: "POST",
    credentials: "include",
  });
}

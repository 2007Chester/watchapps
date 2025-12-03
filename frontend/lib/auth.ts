"use server";

import { API_URL } from "./api";

export async function getUser() {
  try {
    const res = await fetch(`${API_URL}/auth/user`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

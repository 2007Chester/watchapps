"use server";

import { API_URL } from "@/lib/api";
import { redirect } from "next/navigation";

export async function logoutAction() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  redirect("/login");
}

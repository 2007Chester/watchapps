
"use client";

import { apiRequest, setToken } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);

  setToken(res.token);
  return res.user;
}

export async function fetchCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/user", {}, true);
}

export function logout() {
  setToken(null);
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

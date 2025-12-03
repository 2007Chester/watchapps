
const BASE_URL = "https://api.watchapps.ru/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("watchapps_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("watchapps_token", token);
  } else {
    localStorage.removeItem("watchapps_token");
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("watchapps_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

export async function apiFormRequest<T>(
  path: string,
  formData: FormData,
  requireAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {};
  if (requireAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("watchapps_token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let msg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

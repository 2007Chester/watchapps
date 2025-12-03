// Normalize API_URL to ensure it ends with /api (but not /api/api)
function normalizeApiUrl(url: string): string {
  // Remove any trailing slashes
  url = url.trim().replace(/\/+$/, '');
  // Remove /api/api if present at the end
  url = url.replace(/\/api\/api$/, '/api');
  // If it doesn't end with /api, add it
  if (!url.endsWith('/api')) {
    url = url + '/api';
  }
  return url;
}

// Определяем API URL в зависимости от окружения
function getApiUrl(): string {
  // Если установлена переменная окружения, используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
  }
  
  // В браузере определяем по текущему домену
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    const protocol = window.location.protocol;
    
    // Production домены - используем /api, который должен проксироваться nginx на Laravel
    // nginx должен быть настроен для проксирования /api/* на http://localhost:8000/api
    if (host === 'dev.watchapps.ru' || host.includes('dev.watchapps.ru')) {
      // Используем относительный путь /api
      // nginx должен проксировать /api/* на Laravel backend
      return '/api';
    }
    if (host === 'watchapps.ru' || host.includes('watchapps.ru')) {
      return '/api';
    }
    
    // Локальная разработка - используем Next.js API route как прокси
    return '/api';
  }
  
  // SSR fallback - для серверного рендеринга используем переменную окружения или localhost
  return process.env.NEXT_PUBLIC_API_URL 
    ? normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL)
    : 'http://localhost:8000/api';
}

// Экспортируем функцию для получения URL, чтобы она вызывалась динамически
export function getApiUrlDynamic(): string {
  return getApiUrl();
}

// Для обратной совместимости экспортируем константу (будет использоваться только на клиенте)
export const API_URL = typeof window !== 'undefined' ? getApiUrl() : 'http://localhost:8000/api';

/**
 * Храним токен в localStorage (для "Оставаться в системе") или sessionStorage (для сессии)
 */
export function getToken() {
  if (typeof window === "undefined") return null;
  // Сначала проверяем localStorage (долгосрочное хранение)
  const localToken = localStorage.getItem("wa_token");
  if (localToken) return localToken;
  // Затем проверяем sessionStorage (только для текущей сессии)
  return sessionStorage.getItem("wa_token");
}

export function setToken(token: string, remember: boolean = true) {
  if (typeof window === "undefined") return;
  if (remember) {
    // Сохраняем в localStorage для долгосрочного хранения
  localStorage.setItem("wa_token", token);
    sessionStorage.removeItem("wa_token"); // Очищаем sessionStorage если есть
  } else {
    // Сохраняем в sessionStorage только для текущей сессии
    sessionStorage.setItem("wa_token", token);
    localStorage.removeItem("wa_token"); // Очищаем localStorage если есть
  }
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("wa_token");
  sessionStorage.removeItem("wa_token");
}

/**
 * Универсальный API fetch с поддержкой:
 * - многорольности
 * - ошибок
 * - авто-logout при 401
 * - токена Sanctum
 */
export async function apiFetch(path: string, options: any = {}) {
  const token = getToken();
  
  // Получаем API URL динамически (важно для production)
  const apiUrl = typeof window !== 'undefined' ? getApiUrl() : API_URL;
  
  // Debug logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[apiFetch]', { path, hasToken: !!token, apiUrl, tokenPreview: token ? token.substring(0, 20) + '...' : 'none' });
  }
  
  // Normalize path: ensure it starts with / and remove any accidental /api prefix
  // API_URL already includes /api, so we don't want double /api/api/
  let normalizedPath = path.trim();
  
  // Ensure path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Remove /api prefix if present (since API_URL already has it)
  // This handles cases like "/api/auth/register" -> "/auth/register"
  if (normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.substring(4); // Remove '/api'
  } else if (normalizedPath === '/api') {
    normalizedPath = '/';
  }
  
  // Ensure normalized path still starts with / (in case it was removed)
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  let fullUrl = `${apiUrl}${normalizedPath}`;
  
  // Final safety check: remove any double /api/api/ in the URL
  fullUrl = fullUrl.replace(/\/api\/api\//g, '/api/');
  fullUrl = fullUrl.replace(/\/api\/api$/, '/api');
  
  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[apiFetch]', { originalPath: path, normalizedPath, API_URL, fullUrl });
  }

  const headers: any = {
    "Accept": "application/json", // Важно для API-запросов в Laravel
    ...(options.headers || {})
  };

  // JSON-запросы
  const isJson = !(options.body instanceof FormData);

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  // токен
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    ...options,
    credentials: "include",
    headers,
  });

  // Debug logging для 401 ошибок
  if (res.status === 401) {
    const responseText = await res.text();
    console.error('[apiFetch] 401 Unauthorized:', {
      path,
      fullUrl,
      hasToken: !!token,
      responseText: responseText.substring(0, 200),
      headers: Object.fromEntries(res.headers.entries()),
    });
  }

  // Logout on 401
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      // если вызывается с dev.* → отправить на /dev/login
      if (window.location.pathname.startsWith("/dev")) {
        window.location.href = "/dev/login";
      } else {
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized");
  }

  // Ошибка 403 — недостаточно ролей
  if (res.status === 403) {
    throw new Error("У вас нет доступа к этому действию.");
  }

  // Другие ошибки
  if (!res.ok) {
    let message = "Unknown error";

    try {
      const data = await res.json();
      message = data.message || message;
    } catch {}

    throw new Error(message);
  }

  // Успешный ответ JSON
  try {
    const text = await res.text();
    if (!text || text.trim() === '') {
      console.warn('[apiFetch] Empty response body for', fullUrl);
      return {};
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('[apiFetch] Failed to parse JSON response for', fullUrl, e);
    throw new Error('Invalid JSON response from server');
  }
}

/**
 * Быстрые шорткаты
 */
export async function apiLogin(email: string, password: string, remember: boolean = true) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (res?.token) {
    setToken(res.token, remember);
    // Debug logging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[apiLogin] Token saved', remember ? 'to localStorage' : 'to sessionStorage');
    }
  } else {
    console.warn('[apiLogin] No token in response:', res);
  }

  return res;
}

export async function apiRegister(payload: any) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res?.token) {
    setToken(res.token);
  }

  return res;
}

export async function apiLogout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {}
  clearToken();
}

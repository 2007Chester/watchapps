"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getToken, apiFetch, apiLogout } from "@/lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  primary_role?: string;
  logo_url?: string;
  brand_name?: string;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDevDomain, setIsDevDomain] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Определяем, находимся ли мы на dev поддомене или на dev маршруте
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isDev = hostname === "dev.watchapps.ru" || pathname?.startsWith("/dev");
      setIsDevDomain(isDev);
      
      // Проверяем наличие токена
      const token = getToken();
      setIsAuthenticated(!!token);
      
      // Загружаем данные пользователя, если авторизован
      if (token) {
        loadUser();
      }

      // Определяем текущую тему
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme as 'light' | 'dark');
      } else {
        setTheme('system');
        // Применяем системную тему
        if (window.matchMedia) {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    }
  }, [pathname]);

  // Слушаем событие обновления данных пользователя
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUserUpdate = () => {
      console.log("User data update event received, reloading user in Header");
      const token = getToken();
      if (token) {
        loadUser();
      }
    };

    window.addEventListener("userDataUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userDataUpdated", handleUserUpdate);
    };
  }, []);

  // Закрываем меню при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  async function loadUser() {
    try {
      const userData = await apiFetch("/auth/user");
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
      setIsAuthenticated(false);
      setUser(null);
    }
  }

  async function handleLogout() {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setShowMenu(false);
      
      // Редирект на страницу входа
      if (isDevDomain) {
        router.push("/dev/login");
      } else {
        router.push("/login");
      }
    }
  }

  const getAvatarUrl = (): string => {
    if (user?.logo_url) {
      return user.logo_url;
    }
    // Fallback: генерируем инициалы
    return "";
  };

  const getInitials = (): string => {
    if (user?.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (): string => {
    if (user?.brand_name) {
      return user.brand_name;
    }
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email;
    }
    return "Пользователь";
  };

  const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme');
    let newTheme: 'light' | 'dark' | 'system';
    
    if (currentTheme === 'dark') {
      newTheme = 'light';
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } else if (currentTheme === 'light') {
      newTheme = 'system';
      localStorage.removeItem('theme');
      // Применяем системную тему
      if (window.matchMedia) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } else {
      newTheme = 'dark';
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    }
    
    setTheme(newTheme);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border-b border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип и название */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(isDevDomain ? "/dev/dashboard" : "/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-white font-bold text-sm">WA</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Watch Apps
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  маркетплейс для Wear OS
                </span>
              </div>
            </button>
          </div>

          {/* Навигация */}
          <nav className="flex items-center gap-2">
            {/* Переключатель темы */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={
                theme === 'dark' 
                  ? 'Темная тема (нажмите для светлой)' 
                  : theme === 'light' 
                  ? 'Светлая тема (нажмите для системной)' 
                  : 'Системная тема (нажмите для темной)'
              }
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : theme === 'light' ? (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {isAuthenticated && user ? (
              // Аватар с выпадающим меню
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={getDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        // Fallback на инициалы, если изображение не загрузилось
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          const fallback = parent.querySelector(".avatar-fallback") as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={`avatar-fallback w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold ${getAvatarUrl() ? "hidden" : ""}`}
                  >
                    {getInitials()}
                  </div>
                </button>

                {/* Выпадающее меню */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          router.push(isDevDomain ? "/dev/dashboard" : "/");
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Главная
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          router.push(isDevDomain ? "/dev/onboarding" : "/profile");
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Личная информация
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          router.push(isDevDomain ? "/dev/payment" : "/profile/payments");
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Платежные данные
                      </button>
                      {isDevDomain && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            router.push("/dev/dashboard");
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          Статистика
                        </button>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Выход
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Кнопки входа/регистрации для неавторизованных
              <>
                {isDevDomain ? (
                  // Для dev.watchapps.ru: Войти, Регистрация
                  <>
                    <button
                      onClick={() => router.push("/dev/login")}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 active:scale-95"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => router.push("/dev/register")}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-full hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                    >
                      Регистрация
                    </button>
                  </>
                ) : (
                  // Для watchapps.ru: Войти, Регистрация, Разработчикам
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 active:scale-95"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => router.push("/register")}
                      className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 active:scale-95"
                    >
                      Регистрация
                    </button>
                    <button
                      onClick={() => window.location.href = "https://dev.watchapps.ru"}
                      className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-full hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                    >
                      Разработчикам
                    </button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

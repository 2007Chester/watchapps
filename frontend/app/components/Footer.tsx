"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDevDomain, setIsDevDomain] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isDev = hostname === "dev.watchapps.ru" || pathname?.startsWith("/dev");
      setIsDevDomain(isDev);
    }
  }, [pathname]);

  return (
    <footer className="w-full backdrop-blur-2xl bg-white/70 dark:bg-gray-900/70 border-t border-white/20 dark:border-gray-700/30 shadow-lg shadow-black/5 dark:shadow-black/20 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О проекте */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">WA</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Watch Apps
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md leading-relaxed">
              Маркетплейс для циферблатов и приложений для Wear OS. 
              Откройте для себя лучшие решения для ваших умных часов.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Навигация
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => router.push(isDevDomain ? "/dev/dashboard" : "/")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                >
                  Главная
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push(isDevDomain ? "/dev/login" : "/login")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                >
                  Войти
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push(isDevDomain ? "/dev/register" : "/register")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                >
                  Регистрация
                </button>
              </li>
              {!isDevDomain && (
                <li>
                  <a
                    href="https://dev.watchapps.ru"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 inline-block"
                  >
                    Разработчикам
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Контакты
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@watchapps.ru"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 inline-block"
                >
                  support@watchapps.ru
                </a>
              </li>
              {!isDevDomain && (
                <li>
                  <a
                    href="https://dev.watchapps.ru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 inline-block"
                  >
                    Dev Console
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-8 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Watch Apps. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                Политика конфиденциальности
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg px-2 py-1 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
              >
                Условия использования
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


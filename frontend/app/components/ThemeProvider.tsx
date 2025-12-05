"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Функция для применения темы
    const applyTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || savedTheme === 'light') {
          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          // Используем системную тему
          if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const isDark = mediaQuery.matches;
            
            if (isDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        }
      } catch (e) {
        console.error('Error applying theme:', e);
      }
    };

    // Применяем тему сразу
    applyTheme();

    // Слушаем изменения системной темы (только если пользователь не выбрал тему вручную)
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          if (e.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      };

      // Современный способ
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // Fallback для старых браузеров
        mediaQuery.addListener(handleChange);
      }
    }
  }, []);

  // Предотвращаем мигание при первой загрузке
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}



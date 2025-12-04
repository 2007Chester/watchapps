
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import './globals.css'
import type { Metadata } from 'next'
import Header from './components/Header'
import Footer from './components/Footer'
import ThemeProvider from './components/ThemeProvider'

export const metadata: Metadata = {
  title: 'WatchApps - Маркетплейс для Wear OS',
  description: 'WatchApps - маркетплейс для циферблатов и приложений для Wear OS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Проверяем сохраненный выбор пользователя
                  const savedTheme = localStorage.getItem('theme');
                  
                  if (savedTheme === 'dark' || savedTheme === 'light') {
                    // Используем сохраненную тему
                    if (savedTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    // Определяем системную тему
                    if (typeof window !== 'undefined' && window.matchMedia) {
                      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                      const isDark = mediaQuery.matches;
                      
                      if (isDark) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                      
                      // Слушаем изменения системной темы (только если пользователь не выбрал тему вручную)
                      mediaQuery.addEventListener('change', function(e) {
                        if (!localStorage.getItem('theme')) {
                          if (e.matches) {
                            document.documentElement.classList.add('dark');
                          } else {
                            document.documentElement.classList.remove('dark');
                          }
                        }
                      });
                    } else {
                      // Fallback: проверяем время суток (для старых браузеров)
                      const hour = new Date().getHours();
                      if (hour >= 20 || hour < 6) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }
                  }
                } catch (e) {
                  // В случае ошибки используем светлую тему по умолчанию
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 relative">
        {/* Декоративные элементы для glassmorphism эффекта */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-40 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-blob animation-delay-6000"></div>
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <ThemeProvider>
            <Header />
            <main className="flex-1 relative z-10">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}

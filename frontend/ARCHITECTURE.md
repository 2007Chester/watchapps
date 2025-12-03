# Архитектура фронтенда WatchApps

## Основной стек

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS

## Структура проекта (план)

- `/app` — маршруты и страницы
  - `/` — главная (баннеры, топы, подборки)
  - `/top` — топ продаж
  - `/new` — новинки
  - `/discounts` — скидки
  - `/category/[slug]` — страница категории
  - `/watchface/[slug]` — страница товара
  - `/auth/login`, `/auth/register`
  - `/profile` — личный кабинет
- `/components` — общие UI‑компоненты
- `/lib` — клиенты API, хелперы
- `/styles` — глобальные стили

## Взаимодействие с backend

Фронтенд работает только через REST API Laravel backend:

- авторизация (Sanctum + Bearer / cookie)
- каталог watchfaces
- страница товара
- покупки
- профиль пользователя

Все эндпоинты описываются в BACKEND_API.md backend‑репозитория.

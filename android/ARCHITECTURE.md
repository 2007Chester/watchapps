# Архитектура Android‑приложения WatchApps

## Слои

- UI (Activity/Fragment/Compose)
- Domain (use‑cases)
- Data (репозитории, API‑клиент)
- Infra (логирование, storage)

## Основные модули

- auth — авторизация и хранение токена
- catalog — список циферблатов, фильтры
- product — карточка товара
- purchases — история покупок
- wear‑sync — взаимодействие с Wear OS (Data Layer / FileTransfer)
- settings — профиль пользователя

## Взаимодействие с backend

Android использует REST API Laravel backend:

- `/api/auth/*`
- `/api/catalog/*`
- `/api/watchface/{id}`
- `/api/watchface/{id}/download`
- `/api/device/install-status`

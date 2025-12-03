# Устранение проблем с проверкой email

## Проблема: "Ошибка соединения" при проверке email

### Шаг 1: Проверьте, что backend сервер запущен

```bash
cd /var/www/watchapps/backend
php artisan serve
```

Сервер должен запуститься на `http://localhost:8000`

### Шаг 2: Проверьте консоль браузера

Откройте DevTools (F12) → вкладка Console и Network:
- Проверьте, какой URL используется для запроса
- Проверьте статус ответа
- Проверьте ошибки CORS

### Шаг 3: Проверьте переменную окружения

Убедитесь, что `NEXT_PUBLIC_API_URL` не установлена, или установлена правильно:

```bash
# В watchapps-frontend/.env.local (если есть)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

По умолчанию используется `http://localhost:8000/api`

### Шаг 4: Проверьте CORS

В `backend/config/cors.php` должны быть разрешены:
- `http://localhost:3000`
- `http://localhost`

### Шаг 5: Проверьте логи

В консоли браузера вы должны видеть:
- `API_URL: http://localhost:8000/api`
- `Checking email at: http://localhost:8000/api/auth/check-email`
- `Response status: 200 OK` (если всё работает)

### Шаг 6: Тест эндпоинта напрямую

```bash
curl -X POST http://localhost:8000/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"developer"}'
```

Должен вернуть JSON:
```json
{"exists":false,"exists_other":false}
```

## Частые ошибки

1. **"Failed to fetch"** → Backend не запущен или неправильный URL
2. **CORS error** → Проверьте `config/cors.php` и добавьте ваш origin
3. **404 Not Found** → Проверьте, что маршрут зарегистрирован: `php artisan route:list | grep check-email`
4. **500 Internal Server Error** → Проверьте логи Laravel: `tail -f storage/logs/laravel.log`







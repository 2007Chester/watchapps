# Настройка почты для watchapps.ru

## Вариант 1: Локальный Postfix (для тестирования)

### Установка и настройка

```bash
cd /var/www/watchapps/backend
sudo ./setup-mail.sh
```

### Обновление .env

Добавьте в `.env` файл:

```env
MAIL_MAILER=sendmail
MAIL_FROM_ADDRESS=noreply@watchapps.ru
MAIL_FROM_NAME="WatchApps"
```

### Тестирование

```bash
# Отправка тестового письма
echo "Test message" | mail -s "Test from watchapps.ru" your-email@example.com

# Проверка логов
tail -f /var/log/mail.log
```

## Вариант 2: Внешний SMTP сервис (рекомендуется для production)

### Использование SMTP провайдера (Mail.ru, Yandex, Gmail и т.д.)

Обновите `.env` файл:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mail.ru
MAIL_PORT=465
MAIL_USERNAME=noreply@watchapps.ru
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@watchapps.ru
MAIL_FROM_NAME="WatchApps"
```

### Или используйте специализированные сервисы

#### Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=watchapps.ru
MAILGUN_SECRET=your-mailgun-secret
MAILGUN_ENDPOINT=api.mailgun.net
MAIL_FROM_ADDRESS=noreply@watchapps.ru
MAIL_FROM_NAME="WatchApps"
```

#### Postmark
```env
MAIL_MAILER=postmark
POSTMARK_API_KEY=your-postmark-api-key
MAIL_FROM_ADDRESS=noreply@watchapps.ru
MAIL_FROM_NAME="WatchApps"
```

#### AWS SES
```env
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
MAIL_FROM_ADDRESS=noreply@watchapps.ru
MAIL_FROM_NAME="WatchApps"
```

## Настройка DNS записей

Для правильной доставки почты нужно настроить DNS записи:

### SPF запись
Добавьте TXT запись в DNS:
```
v=spf1 mx a:mail.watchapps.ru ~all
```

### DKIM запись
1. Сгенерируйте ключи DKIM (если используете Postfix)
2. Добавьте публичный ключ в DNS как TXT запись для `_domainkey.watchapps.ru`

### DMARC запись
Добавьте TXT запись для `_dmarc.watchapps.ru`:
```
v=DMARC1; p=none; rua=mailto:dmarc@watchapps.ru
```

## Проверка настройки

После настройки проверьте:

```bash
cd /var/www/watchapps/backend
php artisan tinker
```

В tinker:
```php
Mail::raw('Test message', function($msg) {
    $msg->to('your-email@example.com')
        ->subject('Test from WatchApps');
});
```

## Очистка кеша

После изменения настроек:
```bash
php artisan config:clear
php artisan cache:clear
```




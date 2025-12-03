# Статус настройки почты для watchapps.ru

## ✅ Что уже сделано:

1. **Postfix установлен и настроен**
   - Домен: watchapps.ru
   - Hostname: mail.watchapps.ru
   - Отправитель: noreply@watchapps.ru

2. **Laravel настроен**
   - MAIL_MAILER=sendmail
   - MAIL_FROM_ADDRESS=noreply@watchapps.ru
   - MAIL_FROM_NAME="WatchApps"

3. **Почта работает**
   - Postfix активен и принимает письма
   - Тестовое письмо отправлено успешно

## 📋 Что нужно сделать дальше:

### 1. Настроить DNS записи

Добавьте следующие записи в DNS вашего домена watchapps.ru:

#### SPF запись (обязательно)
```
Тип: TXT
Имя: @
Значение: v=spf1 mx a:mail.watchapps.ru ip4:81.177.139.192 ~all
```

#### A запись для mail
```
Тип: A
Имя: mail
Значение: IP_адрес_вашего_сервера
```

#### DMARC запись (рекомендуется)
```
Тип: TXT
Имя: _dmarc
Значение: v=DMARC1; p=none; rua=mailto:dmarc@watchapps.ru
```

Подробная инструкция: `/var/www/watchapps/DNS_SETUP.md`

### 2. Проверить отправку через Laravel

```bash
cd /var/www/watchapps/backend
php artisan tinker
```

В tinker:
```php
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use App\Models\User;

$user = User::first();
$token = 'test-token';
$url = 'https://watchapps.ru/verify-email?token=' . $token;

Mail::to('your-email@example.com')->send(new VerifyEmail($user, $url));
```

### 3. Мониторинг логов

```bash
# Логи Postfix
tail -f /var/log/mail.log

# Логи Laravel
tail -f storage/logs/laravel.log
```

## 🔧 Альтернативные варианты

Если локальный Postfix не подходит, можно использовать:

1. **Внешний SMTP** (Mail.ru, Yandex, Gmail)
2. **Специализированные сервисы** (Mailgun, Postmark, AWS SES)

Инструкция: `/var/www/watchapps/backend/MAIL_SETUP.md`

## 📧 Текущие настройки

- **Драйвер**: sendmail (локальный Postfix)
- **Отправитель**: noreply@watchapps.ru
- **Имя отправителя**: WatchApps
- **Статус Postfix**: ✅ Активен

## ⚠️ Важно

1. Убедитесь, что порты 25, 587, 465 открыты в firewall
2. Настройте SPF, DKIM, DMARC для лучшей доставляемости
3. Проверяйте логи на наличие ошибок
4. Для production рекомендуется использовать внешний SMTP сервис


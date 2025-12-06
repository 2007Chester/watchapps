#!/bin/bash

# Скрипт настройки SMTP для Laravel (обход блокировки порта 25)

echo "=== Настройка SMTP для отправки почты ==="
echo ""

ENV_FILE="/var/www/watchapps/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Ошибка: .env файл не найден!"
    exit 1
fi

echo "Текущие настройки MAIL:"
grep "^MAIL_" "$ENV_FILE" || echo "Настройки MAIL не найдены"
echo ""

echo "Выберите вариант SMTP:"
echo "1. smtp.mail.ru (порт 587, TLS)"
echo "2. smtp.yandex.ru (порт 587, TLS)"
echo "3. smtp.hosting.reg.ru (порт 587, TLS) - если есть почтовый ящик"
echo "4. Другой SMTP сервер (вручную)"
echo ""
read -p "Ваш выбор (1-4): " choice

case $choice in
    1)
        SMTP_HOST="smtp.mail.ru"
        SMTP_PORT="587"
        SMTP_ENCRYPTION="tls"
        ;;
    2)
        SMTP_HOST="smtp.yandex.ru"
        SMTP_PORT="587"
        SMTP_ENCRYPTION="tls"
        ;;
    3)
        SMTP_HOST="smtp.hosting.reg.ru"
        SMTP_PORT="587"
        SMTP_ENCRYPTION="tls"
        ;;
    4)
        read -p "SMTP хост: " SMTP_HOST
        read -p "SMTP порт (обычно 587): " SMTP_PORT
        read -p "Шифрование (tls/ssl): " SMTP_ENCRYPTION
        ;;
    *)
        echo "Неверный выбор"
        exit 1
        ;;
esac

echo ""
read -p "Email для отправки (например, noreply@watchapps.ru): " SMTP_USERNAME
read -sp "Пароль для SMTP: " SMTP_PASSWORD
echo ""

# Удаляем старые MAIL настройки
sed -i '/^MAIL_/d' "$ENV_FILE"

# Добавляем новые настройки
cat >> "$ENV_FILE" <<EOF

# Mail Configuration (SMTP через порт 587)
MAIL_MAILER=smtp
MAIL_HOST=$SMTP_HOST
MAIL_PORT=$SMTP_PORT
MAIL_USERNAME=$SMTP_USERNAME
MAIL_PASSWORD=$SMTP_PASSWORD
MAIL_ENCRYPTION=$SMTP_ENCRYPTION
MAIL_FROM_ADDRESS=$SMTP_USERNAME
MAIL_FROM_NAME="WatchApps"
EOF

echo ""
echo "✅ Настройки SMTP добавлены в .env"
echo ""
echo "Новые настройки:"
grep "^MAIL_" "$ENV_FILE"
echo ""
echo "Теперь выполните:"
echo "  cd /var/www/watchapps/backend"
echo "  php artisan config:clear"
echo "  php artisan cache:clear"
echo ""
echo "И протестируйте отправку письма!"





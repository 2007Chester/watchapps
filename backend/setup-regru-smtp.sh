#!/bin/bash

# Скрипт настройки SMTP для reg.ru хостинга

echo "=== Настройка SMTP для reg.ru хостинга ==="
echo ""

ENV_FILE="/var/www/watchapps/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Ошибка: .env файл не найден!"
    exit 1
fi

echo "Для настройки SMTP reg.ru вам понадобится:"
echo "1. Почтовый ящик на хостинге reg.ru (например, noreply@watchapps.ru)"
echo "2. Пароль от этого почтового ящика"
echo ""

read -p "Email адрес для отправки (например, noreply@watchapps.ru): " SMTP_USERNAME
read -sp "Пароль от почтового ящика: " SMTP_PASSWORD
echo ""

# Проверяем формат email
if [[ ! "$SMTP_USERNAME" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "Ошибка: Неверный формат email адреса"
    exit 1
fi

# Извлекаем домен из email
DOMAIN=$(echo "$SMTP_USERNAME" | cut -d'@' -f2)

echo ""
echo "Настройка для домена: $DOMAIN"
echo ""

# Удаляем старые MAIL настройки
sed -i '/^MAIL_/d' "$ENV_FILE"

# Добавляем новые настройки для reg.ru
cat >> "$ENV_FILE" <<EOF

# Mail Configuration (SMTP reg.ru хостинг)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hosting.reg.ru
MAIL_PORT=587
MAIL_USERNAME=$SMTP_USERNAME
MAIL_PASSWORD=$SMTP_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=$SMTP_USERNAME
MAIL_FROM_NAME="WatchApps"
EOF

echo ""
echo "✅ Настройки SMTP для reg.ru добавлены в .env"
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


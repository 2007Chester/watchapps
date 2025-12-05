#!/bin/bash

# Скрипт для добавления настроек почты в .env

ENV_FILE="/var/www/watchapps/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Ошибка: .env файл не найден!"
    exit 1
fi

echo "Добавление настроек почты в .env..."

# Проверяем, есть ли уже настройки MAIL
if grep -q "^MAIL_MAILER=" "$ENV_FILE"; then
    echo "Настройки MAIL уже существуют в .env"
    echo "Текущие настройки:"
    grep "^MAIL_" "$ENV_FILE"
    echo ""
    read -p "Перезаписать? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Отменено"
        exit 0
    fi
    # Удаляем старые настройки
    sed -i '/^MAIL_/d' "$ENV_FILE"
fi

# Добавляем настройки почты
cat >> "$ENV_FILE" <<EOF

# Mail Configuration
MAIL_MAILER=sendmail
MAIL_FROM_ADDRESS=noreply@watchapps.ru
MAIL_FROM_NAME="WatchApps"
EOF

echo "Настройки почты добавлены в .env:"
echo ""
grep "^MAIL_" "$ENV_FILE"
echo ""
echo "Для использования внешнего SMTP, отредактируйте .env и добавьте:"
echo "MAIL_MAILER=smtp"
echo "MAIL_HOST=smtp.example.com"
echo "MAIL_PORT=587"
echo "MAIL_USERNAME=your-email@watchapps.ru"
echo "MAIL_PASSWORD=your-password"
echo "MAIL_ENCRYPTION=tls"




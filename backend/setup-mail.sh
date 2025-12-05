#!/bin/bash

# Скрипт настройки почты для домена watchapps.ru

echo "=== Настройка почты для watchapps.ru ==="

# 1. Установка Postfix
echo "1. Установка Postfix..."
DEBIAN_FRONTEND=noninteractive apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y postfix mailutils

# 2. Настройка Postfix
echo "2. Настройка Postfix..."

# Определяем hostname
HOSTNAME=$(hostname -f)
DOMAIN="watchapps.ru"

# Настройка main.cf
cat > /etc/postfix/main.cf <<EOF
# Основные настройки
myhostname = mail.watchapps.ru
mydomain = watchapps.ru
myorigin = \$mydomain
inet_interfaces = loopback-only
inet_protocols = ipv4

# Сети
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128

# Домены
mydestination = \$myhostname, localhost.\$mydomain, localhost, \$mydomain

# Ограничения
message_size_limit = 10240000
mailbox_size_limit = 0

# Логирование
maillog_file = /var/log/mail.log

# TLS (если есть сертификаты)
smtp_tls_security_level = may
smtpd_tls_security_level = may
smtpd_tls_auth_only = yes

# Отправитель
smtp_generic_maps = hash:/etc/postfix/generic

# Relay (если нужен внешний SMTP)
# relayhost = [smtp.example.com]:587
# smtp_sasl_auth_enable = yes
# smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
# smtp_sasl_security_options = noanonymous
EOF

# Настройка generic maps для правильного отправителя
echo "@${HOSTNAME} noreply@watchapps.ru" > /etc/postfix/generic
postmap /etc/postfix/generic

# Перезапуск Postfix
systemctl restart postfix
systemctl enable postfix

echo "3. Проверка статуса Postfix..."
systemctl status postfix --no-pager | head -5

echo ""
echo "=== Настройка завершена ==="
echo ""
echo "Теперь нужно:"
echo "1. Обновить .env файл с настройками:"
echo "   MAIL_MAILER=sendmail"
echo "   MAIL_FROM_ADDRESS=noreply@watchapps.ru"
echo "   MAIL_FROM_NAME=\"WatchApps\""
echo ""
echo "2. Настроить DNS записи для домена watchapps.ru:"
echo "   - SPF: v=spf1 mx a:mail.watchapps.ru ~all"
echo "   - DKIM: (нужно сгенерировать ключи)"
echo "   - DMARC: v=DMARC1; p=none; rua=mailto:dmarc@watchapps.ru"
echo ""
echo "3. Протестировать отправку:"
echo "   echo 'Test' | mail -s 'Test' your-email@example.com"




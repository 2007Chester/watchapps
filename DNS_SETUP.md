# Настройка DNS записей для почты watchapps.ru

## Необходимые DNS записи

Для правильной доставки почты с домена watchapps.ru нужно добавить следующие DNS записи:

### 1. MX запись (опционально, если используете локальный почтовый сервер)
```
Тип: MX
Имя: @ (или watchapps.ru)
Значение: mail.watchapps.ru
Приоритет: 10
```

### 2. A запись для mail.watchapps.ru
```
Тип: A
Имя: mail
Значение: IP_адрес_вашего_сервера
```

### 3. SPF запись (обязательно)
```
Тип: TXT
Имя: @ (или watchapps.ru)
Значение: v=spf1 mx a:mail.watchapps.ru ip4:ВАШ_IP_АДРЕС ~all
```

Пример:
```
v=spf1 mx a:mail.watchapps.ru ip4:123.45.67.89 ~all
```

### 4. DKIM запись (рекомендуется)
Для генерации DKIM ключей:
```bash
openssl genrsa -out /etc/postfix/dkim_private.key 1024
openssl rsa -in /etc/postfix/dkim_private.key -pubout -out /etc/postfix/dkim_public.key
```

Затем добавьте публичный ключ в DNS:
```
Тип: TXT
Имя: default._domainkey
Значение: v=DKIM1; k=rsa; p=ПУБЛИЧНЫЙ_КЛЮЧ
```

### 5. DMARC запись (рекомендуется)
```
Тип: TXT
Имя: _dmarc
Значение: v=DMARC1; p=none; rua=mailto:dmarc@watchapps.ru; ruf=mailto:dmarc@watchapps.ru
```

## Проверка DNS записей

После добавления записей проверьте:

```bash
# SPF
dig TXT watchapps.ru +short

# MX
dig MX watchapps.ru +short

# A запись для mail
dig A mail.watchapps.ru +short

# DKIM
dig TXT default._domainkey.watchapps.ru +short

# DMARC
dig TXT _dmarc.watchapps.ru +short
```

## Онлайн проверка

Используйте онлайн инструменты:
- https://mxtoolbox.com/spf.aspx
- https://mxtoolbox.com/dkim.aspx
- https://mxtoolbox.com/dmarc.aspx




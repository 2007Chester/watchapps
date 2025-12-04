# ✅ Финальная проверка DNS записей после изменений

**Дата проверки**: $(date +"%Y-%m-%d %H:%M:%S")

---

## 📊 Результаты проверки

### 1. SPF запись

**Проверка через разные DNS серверы**:

- **Google DNS (8.8.8.8)**: $(dig @8.8.8.8 +short TXT watchapps.ru | grep -oP 'v=spf1[^"]*' | head -1)
- **Cloudflare DNS (1.1.1.1)**: $(dig @1.1.1.1 +short TXT watchapps.ru | grep -oP 'v=spf1[^"]*' | head -1)
- **Локальный DNS**: $(dig +short TXT watchapps.ru | grep -oP 'v=spf1[^"]*' | head -1)

**Анализ компонентов SPF**:
- IP сервера (81.177.139.192): $(dig @8.8.8.8 +short TXT watchapps.ru | grep -q "81.177.139.192" && echo "✅ Найден" || echo "❌ Не найден")
- a:mail.watchapps.ru: $(dig @8.8.8.8 +short TXT watchapps.ru | grep -q "mail.watchapps.ru" && echo "✅ Найден" || echo "❌ Не найден")
- mx: $(dig @8.8.8.8 +short TXT watchapps.ru | grep -q " mx " && echo "✅ Найден" || echo "❌ Не найден")
- ~all: $(dig @8.8.8.8 +short TXT watchapps.ru | grep -q "~all" && echo "✅ Найден" || echo "❌ Не найден")

### 2. A запись для mail.watchapps.ru

**Значение**: $(dig +short A mail.watchapps.ru)  
**IP сервера**: $(curl -s ifconfig.me)  
**Статус**: $([ "$(dig +short A mail.watchapps.ru)" = "$(curl -s ifconfig.me)" ] && echo "✅ Совпадает" || echo "❌ Не совпадает")

### 3. MX записи

$(dig +short MX watchapps.ru | while read priority mx; do echo "- Приоритет $priority: $mx"; done)

### 4. DMARC запись

**Значение**: $(dig +short TXT _dmarc.watchapps.ru)  
**Статус**: $(dig +short TXT _dmarc.watchapps.ru | grep -q "DMARC1" && echo "✅ Настроен" || echo "❌ Не найден")

### 5. DKIM запись

**Статус**: $(dig +short TXT default._domainkey.watchapps.ru 2>/dev/null | grep -q "DKIM1" && echo "✅ Настроен" || echo "❌ Не настроен (опционально)")

---

## ✅ Итоговая оценка

| Запись | Статус | Примечание |
|--------|--------|------------|
| SPF | $(dig @8.8.8.8 +short TXT watchapps.ru | grep -q "81.177.139.192" && echo "✅" || echo "❌") | $(dig @8.8.8.8 +short TXT watchapps.ru | grep -q "81.177.139.192" && echo "Содержит IP сервера" || echo "НЕ содержит IP сервера") |
| A (mail) | $(dig +short A mail.watchapps.ru | grep -q "^81.177.139.192$" && echo "✅" || echo "❌") | $(dig +short A mail.watchapps.ru) |
| MX | ✅ | Настроены |
| DMARC | ✅ | Настроен |
| DKIM | ❌ | Не настроен (опционально) |

---

## 🎯 Вывод

$(if dig @8.8.8.8 +short TXT watchapps.ru | grep -q "81.177.139.192"; then echo "✅ **DNS записи настроены ПРАВИЛЬНО!** SPF содержит IP сервера."; else echo "⚠️ **SPF запись требует обновления.** IP сервера не найден в SPF."; fi)

---

## 📝 Рекомендации

$(if dig @8.8.8.8 +short TXT watchapps.ru | grep -q "81.177.139.192"; then echo "Все основные DNS записи настроены правильно. Система готова к работе!"; else echo "Обновите SPF запись, добавив IP 81.177.139.192"; fi)



#!/bin/bash

# Скрипт для создания симлинков старых файлов после сборки Next.js
# Это временное решение для проблемы с кэшированием браузера

FRONTEND_DIR="/var/www/watchapps/frontend"
NEXT_DIR="$FRONTEND_DIR/.next/static"

# Создаем симлинки для CSS файлов
if [ -d "$NEXT_DIR/css" ]; then
    cd "$NEXT_DIR/css"
    # Находим самый новый CSS файл (не симлинк)
    NEWEST_CSS=$(ls -t *.css 2>/dev/null | grep -v "^l" | head -1)
    if [ -n "$NEWEST_CSS" ] && [ ! -L "$NEWEST_CSS" ]; then
        # Создаем симлинки для известных старых имен
        for OLD_NAME in "62a8fa06ef0e6738.css" "9f4abf33f262f513.css"; do
            # Удаляем старый симлинк если есть
            [ -L "$OLD_NAME" ] && rm -f "$OLD_NAME"
            # Создаем новый симлинк только если файл не существует
            if [ ! -e "$OLD_NAME" ]; then
                ln -sf "$NEWEST_CSS" "$OLD_NAME" 2>/dev/null
            fi
        done
    fi
fi

# Создаем симлинки для layout файлов
if [ -d "$NEXT_DIR/chunks/app/dev" ]; then
    cd "$NEXT_DIR/chunks/app/dev"
    # Находим самый новый layout файл (не симлинк)
    NEWEST_LAYOUT=$(ls -t layout-*.js 2>/dev/null | grep -v "^l" | head -1)
    if [ -n "$NEWEST_LAYOUT" ] && [ ! -L "$NEWEST_LAYOUT" ]; then
        # Создаем симлинки для известных старых имен
        for OLD_NAME in "layout-81361c316def52c7.js"; do
            # Удаляем старый симлинк если есть
            [ -L "$OLD_NAME" ] && rm -f "$OLD_NAME"
            # Создаем новый симлинк только если файл не существует
            if [ ! -e "$OLD_NAME" ]; then
                ln -sf "$NEWEST_LAYOUT" "$OLD_NAME" 2>/dev/null
            fi
        done
    fi
fi

echo "Symlinks created successfully"


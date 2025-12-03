import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const path = req.nextUrl.pathname;

  // --- Работает только на поддомене DEV ---
  if (host === "dev.watchapps.ru") {

    // --- Разрешённые пути ---
    const allowed = [
      "/dev",
      "/dev/",
      "/dev/login",
      "/dev/register",
      "/dev/dashboard",
    ];

    // Разрешаем вложенные dev маршруты /dev/watchfaces/*
    if (path.startsWith("/dev/watchfaces")) {
      return NextResponse.next();
    }

    // Если путь полностью разрешён → пропускаем
    if (allowed.includes(path)) {
      return NextResponse.next();
    }

    // Если путь начинается с /dev → пропускаем
    if (path.startsWith("/dev/")) {
      return NextResponse.next();
    }

    // Если это НЕ /dev → отправляем на /dev/login
    return NextResponse.redirect(new URL("/dev/login", req.url));
  }

  // Обычно работа фронта
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};

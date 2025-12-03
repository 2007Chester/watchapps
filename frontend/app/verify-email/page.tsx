"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");

  useEffect(() => {
    async function verify() {
      if (!token) return;

      try {
        await fetch(`https://api.watchapps.ru/api/auth/verify/${token}`);
        window.location.href = "/verify/success";
      } catch {
        alert("Ошибка подтверждения email.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#05060A] flex justify-center items-center">
      <p className="text-white/80 text-lg">Подтверждаем email…</p>
    </div>
  );
}

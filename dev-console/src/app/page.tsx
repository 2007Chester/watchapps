
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <p className="text-slate-400 text-sm">Redirecting…</p>
    </main>
  );
}

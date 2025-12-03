"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/logout/actions";

export default function Header({ user }: { user: any }) {
  const router = useRouter();

  return (
    <header className="p-4 flex justify-between">
      <span className="text-white text-xl font-semibold">WatchApps</span>

      {user ? (
        <button
          onClick={() => logoutAction()}
          className="text-white bg-red-600 px-4 py-2 rounded-lg"
        >
          Выйти
        </button>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="text-white bg-gray-700 px-4 py-2 rounded-lg"
        >
          Войти
        </button>
      )}
    </header>
  );
}

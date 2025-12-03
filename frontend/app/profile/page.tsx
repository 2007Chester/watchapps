import { getUser } from "@/lib/auth";
import { logoutAction } from "../logout/actions";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    return (
      <meta httpEquiv="refresh" content="0; url=/login?redirect=/profile" />
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md p-6 rounded-xl bg-gray-900 border border-gray-700 text-white">
      <h1 className="text-2xl font-semibold">Профиль</h1>

      <div className="mt-4 space-y-2 text-gray-300">
        <p><strong>Имя:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Роль:</strong> {user.role}</p>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold"
        >
          Выйти из аккаунта
        </button>
      </form>
    </div>
  );
}

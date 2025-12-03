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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">
          Личная информация
        </h1>

        <div className="space-y-6">
          {/* Имя */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Имя
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white">
              {user.name}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Email
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white">
              {user.email}
            </div>
          </div>

          {/* Роль */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Роль
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Выйти из аккаунта
          </button>
        </form>
      </div>
    </div>
  );
}

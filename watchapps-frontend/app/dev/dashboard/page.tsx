import { API_URL } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default async function DevDashboardPage() {
  const user = await getUser();

  if (!user || user.role !== "developer") {
    return (
      <meta
        httpEquiv="refresh"
        content="0; url=/dev/login?redirect=/dev/dashboard"
      />
    );
  }

  // Show warning if onboarding not completed, but don't redirect

  // Загружаем все циферблаты текущего разработчика
  const res = await fetch(`${API_URL}/dev/watchfaces`, {
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json();
  const watchfaces = data.watchfaces || [];

  return (
    <div className="max-w-5xl mx-auto py-10 text-white">

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold">Dev Console</h1>
        <div className="flex gap-3">
          <a
            href="/dev/onboarding"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-500"
          >
            Редактировать профиль
          </a>
        <a
          href="/dev/watchfaces/create"
          className="bg-green-500 text-black px-5 py-2 rounded-lg font-semibold hover:bg-green-400"
        >
          + Новый циферблат
        </a>
      </div>
      </div>

      {!user.onboarding_completed && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm mb-2">
            ⚠️ Завершите настройку профиля разработчика для полного доступа к функциям.
          </p>
          <a
            href="/dev/onboarding"
            className="text-yellow-400 text-sm underline"
          >
            Перейти к настройке профиля →
          </a>
        </div>
      )}

      {/* Если ещё нет циферблатов */}
      {watchfaces.length === 0 && (
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl text-center">
          <p className="text-gray-300">
            У вас пока нет циферблатов.
          </p>
          <a
            href="/dev/watchfaces/create"
            className="inline-block mt-4 bg-green-500 text-black px-5 py-2 rounded-lg font-semibold hover:bg-green-400"
          >
            Создать первый циферблат
          </a>
        </div>
      )}

      {/* СПИСОК ЦИФЕРБЛАТОВ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {watchfaces.map((wf: any) => (
          <div
            key={wf.id}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6"
          >
            {/* ICON */}
            <div className="flex items-center gap-4">
              <img
                src={wf.icon_url || "/placeholder_icon.png"}
                className="w-20 h-20 rounded-xl border border-gray-600 object-cover"
              />

              <div>
                <h2 className="text-xl font-semibold">{wf.name}</h2>
                <p className="text-gray-400 text-sm">slug: {wf.slug}</p>

                {wf.published ? (
                  <p className="text-green-400 text-sm mt-1">Опубликован</p>
                ) : (
                  <p className="text-yellow-400 text-sm mt-1">Черновик</p>
                )}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-6">
              <a
                href={`/dev/watchfaces/${wf.id}/edit`}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
              >
                Редактировать
              </a>

              <a
                href={`/dev/watchfaces/${wf.id}/stats`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-500"
              >
                Статистика
              </a>

              <a
                href={`/watchface/${wf.slug}`}
                target="_blank"
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
              >
                Просмотр
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

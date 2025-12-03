import { API_URL } from "@/lib/api";
import { getUser } from "@/lib/auth";

export default async function WatchfacesList() {
  const user = await getUser();

  if (!user || user.role !== "developer") {
    return <meta httpEquiv="refresh" content="0; url=/login?redirect=/dev/watchfaces" />;
  }

  const res = await fetch(`${API_URL}/dev/watchfaces`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-semibold">Ваши циферблаты</h2>
        <a
          href="/dev/watchfaces/create"
          className="bg-white text-black px-4 py-2 rounded-lg"
        >
          + Создать новый
        </a>
      </div>

      <div className="grid gap-4">
        {data.map((w: any) => (
          <a
            key={w.id}
            href={`/dev/watchfaces/${w.id}/edit`}
            className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800 flex items-center gap-4"
          >
            <img src={w.icon_url} className="w-16 h-16 rounded-xl border border-gray-600" />
            <div>
              <h3 className="font-semibold">{w.name}</h3>
              <p className="text-gray-400 text-sm">
                {w.published ? "Опубликован" : "Черновик"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

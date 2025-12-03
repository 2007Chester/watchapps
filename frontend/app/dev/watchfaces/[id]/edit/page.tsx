import { API_URL } from "@/lib/api";
import {
  updateInfoAction,
  uploadFileAction,
  deleteFileAction,
  publishAction,
  unpublishAction,
} from "./actions";
import UploadZone from "./UploadZone";
import WatchfacePreview from "./WatchfacePreview"; // ← ДОБАВЛЕНО
import { getUser } from "@/lib/auth";

export default async function EditWatchfacePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser();
  if (!user || user.role !== "developer") {
    return (
      <meta
        httpEquiv="refresh"
        content={`0; url=/login?redirect=/dev/watchfaces/${params.id}/edit`}
      />
    );
  }

  const res = await fetch(`${API_URL}/dev/watchfaces/${params.id}`, {
    method: "GET",
    credentials: "include",
  });

  const watchface = await res.json();

  async function upload(type: string, file: File) {
    "use server";

    const fd = new FormData();
    fd.append("type", type);
    fd.append("file", file);

    await uploadFileAction(params.id, fd);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Редактирование: {watchface.name}
      </h1>

      {/* TEXT FIELDS */}
      <form
        action={async (formData) => {
          "use server";
          await updateInfoAction(params.id, formData);
        }}
        className="space-y-4 mb-10"
      >
        <label className="block">
          <span className="text-gray-400">Название</span>
          <input
            name="name"
            defaultValue={watchface.name}
            className="w-full bg-black border border-gray-700 p-2 rounded-lg mt-1"
          />
        </label>

        <label className="block">
          <span className="text-gray-400">Slug</span>
          <input
            name="slug"
            defaultValue={watchface.slug}
            className="w-full bg-black border border-gray-700 p-2 rounded-lg mt-1"
          />
        </label>

        <label className="block">
          <span className="text-gray-400">Цена USD</span>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={watchface.price}
            className="w-full bg-black border border-gray-700 p-2 rounded-lg mt-1"
          />
        </label>

        <label className="block">
          <span className="text-gray-400">Категория</span>
          <select
            name="category"
            defaultValue={watchface.category}
            className="w-full bg-black border border-gray-700 p-2 rounded-lg mt-1"
          >
            <option value="digital">Digital</option>
            <option value="analog">Analog</option>
            <option value="mixed">Mixed</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-400">Описание</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={watchface.description}
            className="w-full bg-black border border-gray-700 p-2 rounded-lg mt-1"
          ></textarea>
        </label>

        <button className="bg-white text-black px-6 py-2 mt-4 rounded-lg">
          Сохранить изменения
        </button>
      </form>

      {/* FILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <UploadZone
          label="APK"
          type="apk"
          onUpload={(file) => upload("apk", file)}
        />

        <UploadZone
          label="Иконку"
          type="icon"
          onUpload={(file) => upload("icon", file)}
        />

        <UploadZone
          label="Баннер"
          type="banner"
          onUpload={(file) => upload("banner", file)}
        />
      </div>

      {/* Screenshots */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Скриншоты</h2>

        <UploadZone
          label="Скриншот"
          type="screenshot"
          onUpload={(file) => upload("screenshot", file)}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {watchface.files
            .filter((f: any) => f.type === "screenshot")
            .map((f: any) => (
              <div key={f.id} className="relative">
                <img
                  src={f.url}
                  className="w-full rounded-lg border border-gray-700"
                />
                <form
                  action={async () => {
                    "use server";
                    await deleteFileAction(params.id, f.id);
                  }}
                  className="absolute top-1 right-1"
                >
                  <button className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                    X
                  </button>
                </form>
              </div>
            ))}
        </div>
      </div>

      {/* PUBLISH */}
      <div className="flex items-center gap-4 mb-10">
        {watchface.published ? (
          <form
            action={async () => {
              "use server";
              await unpublishAction(params.id);
            }}
          >
            <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg">
              Снять с публикации
            </button>
          </form>
        ) : (
          <form
            action={async () => {
              "use server";
              await publishAction(params.id);
            }}
          >
            <button className="bg-green-500 text-black px-6 py-2 rounded-lg">
              Опубликовать
            </button>
          </form>
        )}

        {/* КНОПКА ПРЕДПРОСМОТРА */}
        <a
          href={`/dev/watchfaces/${params.id}/preview`}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Предпросмотр
        </a>
      </div>

      {/* PREVIEW BLOCK */}
      <div className="mt-14">
        <h2 className="text-2xl font-bold mb-4">Предпросмотр</h2>
        <WatchfacePreview watchface={watchface} />
      </div>
    </div>
  );
}

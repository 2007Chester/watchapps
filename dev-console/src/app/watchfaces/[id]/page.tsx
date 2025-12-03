
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, apiFormRequest } from "@/lib/api";
import { logout } from "@/lib/auth";

interface WatchfaceFile {
  id: number;
  type: string;
  upload_id: number;
  sort_order: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Watchface {
  id: number;
  title: string;
  description: string | null;
  price: number;
  discount_price?: number | null;
  discount_end_at?: string | null;
  is_free: boolean;
  type: string;
  status: string;
  categories: Category[];
  files: WatchfaceFile[];
}

interface ShowResponse {
  success: boolean;
  watchface: Watchface;
}

export default function WatchfaceEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params?.id);

  const [item, setItem] = useState<Watchface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | null>(null);
  const [isFree, setIsFree] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiRequest<ShowResponse>(`/dev/watchfaces/${id}`)
      .then((res) => {
        setItem(res.watchface);
        setTitle(res.watchface.title);
        setDescription(res.watchface.description || "");
        setPrice(res.watchface.price);
        setDiscountPrice(res.watchface.discount_price ?? null);
        setIsFree(res.watchface.is_free);
      })
      .catch((err: any) => {
        if (err.message === "Unauthorized") {
          logout();
          return;
        }
        setError(err.message || "Ошибка загрузки");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError(null);
    setLoading(true);
    try {
      const payload: any = {
        title,
        description,
        price: isFree ? 0 : price,
        is_free: isFree,
      };
      if (discountPrice !== null && !Number.isNaN(discountPrice)) {
        payload.discount_price = discountPrice;
      } else {
        payload.discount_price = null;
      }
      const updated = await apiRequest<{ success: boolean; watchface: Watchface }>(
        `/dev/watchfaces/${item.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      setItem(updated.watchface);
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(publish: boolean) {
    if (!item) return;
    setStatusBusy(true);
    setError(null);
    try {
      const path = publish ? "publish" : "unpublish";
      const res = await apiRequest<{ success: boolean; watchface: Watchface }>(
        `/dev/watchfaces/${item.id}/${path}`,
        { method: "POST" }
      );
      setItem(res.watchface);
    } catch (err: any) {
      setError(err.message || "Ошибка изменения статуса");
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) {
    if (!item) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setFileBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const uploadRes = await apiFormRequest<{
        success: boolean;
        upload: { id: number };
      }>("/upload", formData);

      const uploadId = uploadRes.upload.id;

      await apiRequest<{ success: boolean }>(`/dev/watchfaces/${item.id}/files`, {
        method: "POST",
        body: JSON.stringify({
          files: [
            {
              upload_id: uploadId,
              type,
              sort_order: 0,
            },
          ],
        }),
      });

      const refreshed = await apiRequest<ShowResponse>(`/dev/watchfaces/${item.id}`);
      setItem(refreshed.watchface);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки файла");
    } finally {
      setFileBusy(false);
      e.target.value = "";
    }
  }

  async function handleFileDelete(fileId: number) {
    if (!item) return;
    setFileBusy(true);
    setError(null);
    try {
      await apiRequest<{ success: boolean }>(
        `/dev/watchfaces/${item.id}/files/${fileId}`,
        { method: "DELETE" }
      );
      const refreshed = await apiRequest<ShowResponse>(`/dev/watchfaces/${item.id}`);
      setItem(refreshed.watchface);
    } catch (err: any) {
      setError(err.message || "Ошибка удаления файла");
    } finally {
      setFileBusy(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!confirm("Точно удалить этот циферблат?")) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest<{ success: boolean }>(`/dev/watchfaces/${item.id}`, {
        method: "DELETE",
      });
      router.replace("/watchfaces");
    } catch (err: any) {
      setError(err.message || "Ошибка удаления");
      setLoading(false);
    }
  }

  if (loading && !item) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Загрузка...</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-400">
          {error || "Циферблат не найден"}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex">
      <section className="flex-1 p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              Редактирование циферблата
            </p>
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Статус:{" "}
              <span className="text-sky-400 font-medium">
                {item.status}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              className="btn-outline text-xs"
              onClick={handleDelete}
              disabled={loading}
            >
              Удалить
            </button>
            <div className="flex gap-2">
              <button
                className="btn-outline text-xs"
                onClick={() => handlePublish(false)}
                disabled={statusBusy}
              >
                Снять с публикации
              </button>
              <button
                className="btn-primary text-xs"
                onClick={() => handlePublish(true)}
                disabled={statusBusy}
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <form onSubmit={handleSave} className="card space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Название</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Тип</label>
              <input value={item.type} disabled />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Описание</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-300">Цена</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled={isFree}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-300">
                Цена со скидкой
              </label>
              <input
                type="number"
                min={0}
                value={discountPrice ?? ""}
                onChange={(e) =>
                  setDiscountPrice(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="isFree"
                type="checkbox"
                className="w-4 h-4"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <label htmlFor="isFree" className="text-sm text-slate-300">
                Бесплатный
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full md:w-auto"
            disabled={loading}
          >
            {loading ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>

        <div className="card space-y-4">
          <h3 className="text-sm font-semibold">Файлы</h3>
          <p className="text-xs text-slate-400">
            Загрузи иконку, баннер, скриншоты и APK. Сейчас отображается только список файлов в базе.
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Иконка</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "icon")}
                disabled={fileBusy}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Баннер</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "banner")}
                disabled={fileBusy}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">Скриншот</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "screenshot")}
                disabled={fileBusy}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-400">APK</p>
              <input
                type="file"
                accept=".apk"
                onChange={(e) => handleFileUpload(e, "apk")}
                disabled={fileBusy}
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Привязанные файлы</p>
            {item.files.length === 0 && (
              <p className="text-xs text-slate-500">
                Пока нет файлов. Загрузи иконку, баннер, APK или скриншоты.
              </p>
            )}
            {item.files.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Тип</th>
                    <th>Upload ID</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {item.files.map((f) => (
                    <tr key={f.id}>
                      <td className="text-xs">{f.id}</td>
                      <td className="text-xs">{f.type}</td>
                      <td className="text-xs text-slate-400">{f.upload_id}</td>
                      <td className="text-right">
                        <button
                          className="text-xs text-red-400 hover:underline"
                          onClick={() => handleFileDelete(f.id)}
                          disabled={fileBusy}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

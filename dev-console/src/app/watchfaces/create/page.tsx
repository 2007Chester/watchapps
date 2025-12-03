
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface CreateResponse {
  success: boolean;
  watchface: {
    id: number;
  };
}

export default function WatchfaceCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [type, setType] = useState<"watchface" | "app">("watchface");
  const [categories, setCategories] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cats = categories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));

      const payload: any = {
        title,
        description,
        price: isFree ? 0 : price,
        is_free: isFree,
        type,
      };

      if (cats.length > 0) {
        payload.categories = cats;
      }

      const res = await apiRequest<CreateResponse>("/dev/watchfaces", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        router.replace(`/watchfaces/${res.watchface.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка создания циферблата");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      <section className="flex-1 p-4 md:p-8 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">Новый циферблат</h2>
        <p className="text-xs text-slate-400 mb-6">
          Создай карточку товара. Файлы (иконка, баннер, APK, скриншоты) можно будет добавить на следующем шаге.
        </p>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Название</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-sm text-slate-300">Тип</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="watchface">Циферблат</option>
                <option value="app">Приложение</option>
              </select>
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-sm text-slate-300">Цена</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                disabled={isFree}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isFree"
              type="checkbox"
              className="w-4 h-4"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            <label htmlFor="isFree" className="text-sm text-slate-300">
              Бесплатный циферблат
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">
              Категории (ID через запятую)
            </label>
            <input
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="Например: 1,3,5"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Создаём..." : "Создать и перейти к файлам"}
          </button>
        </form>
      </section>
    </main>
  );
}

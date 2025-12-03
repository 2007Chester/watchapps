"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWatchfaceAction } from "./actions";

export default function CreateWatchfacePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createWatchfaceAction(formData);
      router.push(`/dev/watchfaces/${result.id}/edit`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Создать новый циферблат</h1>

      {error && (
        <div className="mb-4 bg-red-800/40 text-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-gray-400 block">Название</label>
          <input
            name="name"
            required
            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block">Slug</label>
          <input
            name="slug"
            required
            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Только латиница, нижний регистр, без пробелов. Пример: chester-dark-pro
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-400 block">Цена (в USD)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            required
            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 block">Категория</label>
          <select
            name="category"
            required
            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mt-1"
          >
            <option value="digital">Digital</option>
            <option value="analog">Analog</option>
            <option value="mixed">Mixed</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 block">Краткое описание</label>
          <textarea
            name="description"
            rows={4}
            className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white mt-1"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200"
        >
          Создать
        </button>
      </form>
    </div>
  );
}

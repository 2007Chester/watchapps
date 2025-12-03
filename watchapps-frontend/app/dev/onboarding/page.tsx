"use client";

import { useState, useEffect } from "react";
import { apiFetch, API_URL } from "@/lib/api";

export default function DeveloperOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});

  // Form fields
  const [brandName, setBrandName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadId, setLogoUploadId] = useState<number | null>(null);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const data = await apiFetch("/dev/onboarding", {
        method: "GET",
      });

      setUser(data.user);
      setBrandName(data.user.brand_name || "");
      setLogoUploadId(data.user.logo_upload_id);
      setLogoPreview(data.user.logo_url);
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setSaving(true);
    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadData = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });
      setLogoUploadId(uploadData.id);
      setLogoPreview(uploadData.url);

      return uploadData.id;
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Ошибка загрузки логотипа");
      return null;
    } finally {
      setSaving(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Размер файла не должен превышать 5MB");
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      // 1. Upload logo if new file selected
      let finalLogoUploadId = logoUploadId;
      if (logoFile) {
        const uploadedId = await handleLogoUpload(logoFile);
        if (!uploadedId) {
          setSaving(false);
          return;
        }
        finalLogoUploadId = uploadedId;
      }

      // Update onboarding data
      try {
        await apiFetch("/dev/onboarding", {
        method: "PUT",
        body: JSON.stringify({
          brand_name: brandName.trim() || null,
          logo_upload_id: finalLogoUploadId,
        }),
      });
      } catch (error: any) {
        setErrors(error.errors || { message: "Ошибка сохранения" });
        setSaving(false);
        return;
      }

      // Complete onboarding only if not already completed
      if (!user?.onboarding_completed) {
        await apiFetch("/dev/onboarding/complete", {
        method: "POST",
      });
      }

      // Show success message and reload data
      alert("Данные успешно сохранены!");
      await loadUserData();
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert("Ошибка сохранения данных");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060A] flex justify-center items-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060A] flex justify-center items-center p-6">
      <div className="max-w-2xl w-full bg-[#151823] border border-white/5 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl text-white text-center mb-2 font-semibold">
          {user?.onboarding_completed ? "Редактирование профиля разработчика" : "Настройка профиля разработчика"}
        </h1>
        <p className="text-white/60 text-center mb-8">
          {user?.onboarding_completed ? "Измените информацию о вашем бренде" : "Заполните информацию о вашем бренде"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">
              Название бренда <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Например: My Watch Studio"
              className="w-full bg-[#10121A] text-white border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
              required
            />
            {errors.brand_name && (
              <p className="text-red-400 text-xs mt-1">{errors.brand_name}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">
              Логотип бренда
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              {logoPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-xl border border-white/10 object-cover"
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    disabled={saving}
                  />
                  <div className="bg-[#10121A] border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-500 transition-colors">
                    <span className="text-white/80 text-sm">
                      {logoPreview ? "Изменить логотип" : "Загрузить логотип"}
                    </span>
                  </div>
                </label>
                <p className="text-white/40 text-xs mt-2">
                  Рекомендуемый размер: 512x512px. Максимум 5MB
                </p>
              </div>
            </div>
            {errors.logo_upload_id && (
              <p className="text-red-400 text-xs mt-1">
                {errors.logo_upload_id}
              </p>
            )}
          </div>

          {/* Email Verification Status */}
          {user && !user.email_verified && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-yellow-400 text-sm">
                ⚠️ Ваш email не подтверждён. Пожалуйста, подтвердите email для
                полного доступа к функциям.
              </p>
              <a
                href="/verify/send"
                className="text-yellow-400 text-sm underline mt-2 inline-block"
              >
                Отправить письмо подтверждения
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !brandName.trim()}
            className={`w-full py-3 rounded-xl text-white font-semibold ${
              saving || !brandName.trim()
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 active:scale-95"
            }`}
          >
            {saving ? "Сохранение..." : user?.onboarding_completed ? "Сохранить изменения" : "Завершить настройку"}
          </button>
        </form>
      </div>
    </div>
  );
}


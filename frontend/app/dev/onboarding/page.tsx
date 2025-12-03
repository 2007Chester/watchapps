"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, API_URL } from "@/lib/api";

export default function DeveloperOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});

  // Form fields
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploadId, setLogoUploadId] = useState<number | null>(null);

  // Load user data
  useEffect(() => {
    loadUserData();

    // Слушаем событие обновления данных пользователя (например, после подтверждения email)
    const handleUserUpdate = () => {
      console.log("User data update event received, reloading user data");
      loadUserData();
    };

    window.addEventListener("userDataUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userDataUpdated", handleUserUpdate);
    };
  }, []);

  async function loadUserData() {
    try {
      const data = await apiFetch("/dev/onboarding", {
        method: "GET",
      });

      console.log("Loaded user data:", {
        logo_upload_id: data.user.logo_upload_id,
        logo_url: data.user.logo_url,
        has_logo: !!data.user.logo_url
      });

      setUser(data.user);
      setEmail(data.user.email || "");
      setBrandName(data.user.brand_name || "");
      setLogoUploadId(data.user.logo_upload_id);
      
      // Всегда устанавливаем preview из URL, если он есть
      if (data.user.logo_url) {
        console.log("Setting logo preview from loaded data:", data.user.logo_url);
        setLogoPreview(data.user.logo_url);
      } else {
        console.log("No logo_url in loaded data, clearing preview");
        setLogoPreview(null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoUpload(file: File) {
    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadData = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadData || !uploadData.id || !uploadData.url) {
        throw new Error("Invalid upload response");
      }
      
      setLogoUploadId(uploadData.id);
      // Используем URL с сервера вместо base64 preview
      // Это важно - заменяем base64 на реальный URL
      if (uploadData.url) {
        setLogoPreview(uploadData.url);
        console.log("Logo uploaded successfully, URL:", uploadData.url);
      }

      return uploadData.id;
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Ошибка загрузки логотипа");
      return null;
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

    // Create temporary preview (base64 для предпросмотра до загрузки)
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Сбрасываем input, чтобы можно было выбрать тот же файл снова
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      // 1. Upload logo if new file selected
      let finalLogoUploadId = logoUploadId;
      
      if (logoFile) {
        // Загружаем файл на сервер
        const uploadedId = await handleLogoUpload(logoFile);
        if (!uploadedId) {
          setSaving(false);
          return;
        }
        finalLogoUploadId = uploadedId;
        // После загрузки файла preview уже обновлен на URL из сервера в handleLogoUpload
      }

      // Update onboarding data
      let updatedUserData;
      try {
        const response = await apiFetch("/dev/onboarding", {
          method: "PUT",
          body: JSON.stringify({
            email: email.trim() || null,
            brand_name: brandName.trim() || null,
            logo_upload_id: finalLogoUploadId,
          }),
        });
        updatedUserData = response.user;
      } catch (error: any) {
        console.error("Error saving onboarding:", error);
        // Обрабатываем ошибки валидации
        if (error.errors) {
          // Laravel возвращает ошибки в формате { field: ["error1", "error2"] }
          // Преобразуем в формат { field: "error1" } для отображения
          const formattedErrors: any = {};
          Object.keys(error.errors).forEach((key) => {
            // Берем первую ошибку для каждого поля
            formattedErrors[key] = Array.isArray(error.errors[key]) 
              ? error.errors[key][0] 
              : error.errors[key];
          });
          setErrors(formattedErrors);
        } else {
          setErrors({ message: error.message || "Ошибка сохранения" });
        }
        setSaving(false);
        return;
      }

      // Complete onboarding only if not already completed
      if (!user?.onboarding_completed) {
        await apiFetch("/dev/onboarding/complete", {
          method: "POST",
        });
      }

      // Всегда перезагружаем данные с сервера после сохранения
      // Это гарантирует, что мы получим актуальный URL логотипа
      console.log("Reloading user data after save...");
      await loadUserData();
      
      setLogoFile(null); // Сбрасываем выбранный файл

      // Уведомляем Header об обновлении данных пользователя
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("userDataUpdated"));
      }

      // Show success message
      alert("Данные успешно сохранены!");
      setSaving(false);
    } catch (error) {
      console.error("Error saving onboarding:", error);
      alert("Ошибка сохранения данных");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 rounded-3xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30">
        <h1 className="text-3xl text-gray-900 dark:text-white text-center mb-2 font-semibold">
          {user?.onboarding_completed ? "Редактирование профиля разработчика" : "Настройка профиля разработчика"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          {user?.onboarding_completed ? "Измените информацию о вашем бренде" : "Заполните информацию о вашем бренде"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2 flex items-center gap-2">
              <span>
                Email <span className="text-red-600 dark:text-red-400">*</span>
              </span>
              {/* Индикатор статуса подтверждения email */}
              {user && (
                <>
                  {user.email_verified || user.verified ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30" title="Email подтвержден">
                      <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 dark:bg-yellow-900/30" title="Email не подтвержден">
                      <svg className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                  )}
                </>
              )}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Очищаем ошибку при изменении поля
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              placeholder="your@email.com"
              className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                errors.email
                  ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20 shadow-sm shadow-red-500/10"
                  : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              При изменении email потребуется повторное подтверждение
            </p>
          </div>

          {/* Brand Name */}
          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              Название бренда <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value);
                // Очищаем ошибку при изменении поля
                if (errors.brand_name) {
                  setErrors({ ...errors, brand_name: undefined });
                }
              }}
              placeholder="Например: My Watch Studio"
              className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                errors.brand_name
                  ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20 shadow-sm shadow-red-500/10"
                  : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10"
              }`}
              required
            />
            {errors.brand_name && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.brand_name}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              Логотип бренда
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              {logoPreview && (
                <div className="flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 rounded-xl border border-gray-200 dark:border-gray-700 object-cover bg-gray-100 dark:bg-gray-800"
                    onError={(e) => {
                      console.error("Error loading logo image:", {
                        url: logoPreview,
                        logoUploadId: logoUploadId
                      });
                      // Если изображение не загрузилось, показываем placeholder
                      const img = e.target as HTMLImageElement;
                      img.src = "/placeholder_icon.png";
                      img.onerror = null; // Предотвращаем бесконечный цикл
                    }}
                    onLoad={() => {
                      console.log("Logo image loaded successfully:", logoPreview);
                    }}
                    key={`${logoPreview}-${logoUploadId}`} // Принудительное обновление при изменении URL или ID
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
                  <div className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/30 dark:border-gray-700/30 rounded-xl px-4 py-3 cursor-pointer hover:border-blue-400/50 dark:hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {logoPreview ? "Изменить логотип" : "Загрузить логотип"}
                    </span>
                  </div>
                </label>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Рекомендуемый размер: 512x512px. Максимум 5MB
                </p>
              </div>
            </div>
            {errors.logo_upload_id && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                {errors.logo_upload_id}
              </p>
            )}
          </div>

          {/* Email Verification Status */}
          {user && !user.email_verified && (
            <div className="bg-yellow-50 dark:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-500 rounded-xl p-4">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                ⚠️ Ваш email не подтверждён. Пожалуйста, подтвердите email для
                полного доступа к функциям.
              </p>
              <a
                href="/verify/send"
                className="text-yellow-600 dark:text-yellow-400 text-sm underline mt-2 inline-block hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
              >
                Отправить письмо подтверждения
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !email.trim() || !brandName.trim()}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
              saving || !email.trim() || !brandName.trim()
                ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                : "backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20"
            }`}
          >
            {saving ? "Сохранение..." : user?.onboarding_completed ? "Сохранить изменения" : "Завершить настройку"}
          </button>

          {/* Home Button */}
          <button
            type="button"
            onClick={() => router.push("/dev/dashboard")}
            className="w-full py-3 rounded-xl text-gray-700 dark:text-gray-300 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 font-semibold transition-all active:scale-95 border border-white/30 dark:border-gray-700/30 shadow-md hover:shadow-lg"
          >
            На главную
          </button>
        </form>
      </div>
    </div>
  );
}


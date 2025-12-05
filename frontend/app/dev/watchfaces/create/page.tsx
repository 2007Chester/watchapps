"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Screenshot = {
  id: number | null;
  file: File | null;
  preview: string | null;
  uploadId: number | null;
  thumbnail?: string | null; // Уменьшенная версия для отображения
  orientation?: "horizontal" | "vertical"; // Горизонтальный (1920x1080) или вертикальный (1080x1920)
};

type ApkInfo = {
  version: string | null;
  wearOsVersion: string | null;
  packageName: string | null;
  minSdk: number | null;
  maxSdk: number | null;
  targetSdk: number | null;
};

export default function CreateWatchfacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [watchfaceId, setWatchfaceId] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form fields
  const [appType, setAppType] = useState<"app" | "watchface">("app"); // app или watchface
  const [isPaid, setIsPaid] = useState(false); // true = платное, false = бесплатное
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountStartAt, setDiscountStartAt] = useState("");
  const [discountEndAt, setDiscountEndAt] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconUploadId, setIconUploadId] = useState<number | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [apkUploadId, setApkUploadId] = useState<number | null>(null);
  const [apkInfo, setApkInfo] = useState<ApkInfo>({
    version: null,
    wearOsVersion: null,
    packageName: null,
    minSdk: null,
    maxSdk: null,
    targetSdk: null,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  
  // Состояния загрузки
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [uploadingApk, setUploadingApk] = useState(false);
  
  // Для drag-and-drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);

  // Load categories and user data
  useEffect(() => {
    loadCategories();
    loadUserData();
  }, []);

  async function loadCategories() {
    try {
      const data = await apiFetch("/dev/categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadUserData() {
    try {
      const userData = await apiFetch("/auth/user");
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setLoading(false);
    }
  }

  // Проверка, может ли пользователь публиковать платные приложения
  const canPublishPaidApps = user?.can_publish_paid_apps || false;
  const isPriceFieldEnabled = isPaid && canPublishPaidApps;

  // Validate icon dimensions
  function validateIconDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width === 512 && img.height === 512) {
          resolve(true);
        } else {
          alert(`Иконка должна быть размером 512x512 пикселей. Текущий размер: ${img.width}x${img.height}`);
          resolve(false);
        }
      };
      img.onerror = () => {
        alert("Ошибка загрузки изображения");
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Validate screenshot dimensions
  function validateScreenshotDimensions(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Принимаем оба варианта: 1920x1080 (горизонтальный) или 1080x1920 (вертикальный)
        const isHorizontal = img.width === 1920 && img.height === 1080;
        const isVertical = img.width === 1080 && img.height === 1920;
        
        if (isHorizontal || isVertical) {
          resolve(true);
        } else {
          alert(`Скриншот должен быть размером 1920x1080 (горизонтальный) или 1080x1920 (вертикальный) пикселей. Текущий размер: ${img.width}x${img.height}`);
          resolve(false);
        }
      };
      img.onerror = () => {
        alert("Ошибка загрузки изображения");
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleIconUpload(file: File) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Иконка должна быть изображением");
      return;
    }

    // Validate dimensions
    const isValid = await validateIconDimensions(file);
    if (!isValid) {
      return;
    }

    setUploadingIcon(true);
    setErrors({ ...errors, icon: undefined });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadData = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadData || !uploadData.id || !uploadData.url) {
        throw new Error("Invalid upload response");
      }

      setIconUploadId(uploadData.id);
      setIconPreview(uploadData.url);
      setIconFile(file);
      setErrors({ ...errors, icon: undefined });
    } catch (error: any) {
      console.error("Error uploading icon:", error);
      let errorMessage = "Ошибка загрузки иконки";
      
      // Показываем конкретное сообщение об ошибке, если оно есть
      if (error.errors && error.errors.file) {
        errorMessage = Array.isArray(error.errors.file) 
          ? error.errors.file[0] 
          : error.errors.file;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setErrors({ ...errors, icon: errorMessage });
    } finally {
      setUploadingIcon(false);
    }
  }

  async function handleScreenshotUpload(file: File) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Скриншот должен быть изображением");
      return;
    }

    // Validate dimensions
    const isValid = await validateScreenshotDimensions(file);
    if (!isValid) {
      return;
    }

    // Check max screenshots
    if (screenshots.length >= 8) {
      alert("Максимум 8 скриншотов");
      return;
    }

    setUploadingScreenshot(true);
    setErrors({ ...errors, screenshots: undefined });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadData = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadData || !uploadData.id || !uploadData.url) {
        throw new Error("Invalid upload response");
      }

      // Создаем уменьшенную версию для отображения
      const thumbnail = await resizeImage(file, 400, 300);

      const newScreenshot: Screenshot = {
        id: null,
        file: file,
        preview: uploadData.url,
        uploadId: uploadData.id,
        thumbnail: thumbnail,
      };

      setScreenshots([...screenshots, newScreenshot]);
      setErrors({ ...errors, screenshots: undefined });
    } catch (error: any) {
      console.error("Error uploading screenshot:", error);
      let errorMessage = "Ошибка загрузки скриншота";
      
      // Показываем конкретное сообщение об ошибке, если оно есть
      if (error.errors && error.errors.file) {
        errorMessage = Array.isArray(error.errors.file) 
          ? error.errors.file[0] 
          : error.errors.file;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setErrors({ ...errors, screenshots: errorMessage });
    } finally {
      setUploadingScreenshot(false);
    }
  }

  // Функция для уменьшения изображения с сохранением пропорций
  function resizeImage(file: File, maxWidth: number = 400, maxHeight: number = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Вычисляем новые размеры с сохранением пропорций
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Создаем canvas для уменьшения
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Не удалось создать canvas context'));
          return;
        }
        
        // Рисуем уменьшенное изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в base64
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Не удалось создать blob'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.85);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  function removeScreenshot(index: number) {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  }

  // Функции для drag-and-drop
  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    if (draggedIndex !== index) {
      const newScreenshots = [...screenshots];
      const draggedItem = newScreenshots[draggedIndex];
      newScreenshots.splice(draggedIndex, 1);
      newScreenshots.splice(index, 0, draggedItem);
      setScreenshots(newScreenshots);
      setDraggedIndex(index);
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  async function handleApkUpload(file: File) {
    // Validate file type
    if (!file.name.endsWith(".apk") && file.type !== "application/vnd.android.package-archive") {
      alert("Файл должен быть APK");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadData = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadData || !uploadData.id || !uploadData.url) {
        throw new Error("Invalid upload response");
      }

      setApkUploadId(uploadData.id);
      setApkFile(file);

      // Parse APK
      try {
        const parseData = await apiFetch("/upload/parse-apk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            upload_id: uploadData.id,
          }),
        });

        if (parseData && parseData.success) {
          setApkInfo({
            version: parseData.version || null,
            wearOsVersion: parseData.wear_os_version || null,
            packageName: parseData.package_name || null,
            minSdk: parseData.min_sdk || null,
            maxSdk: parseData.max_sdk || null,
            targetSdk: parseData.target_sdk || null,
          });
        }
      } catch (parseError) {
        console.error("Error parsing APK:", parseError);
        // Не блокируем сохранение, если парсинг не удался
        setApkInfo({
          version: null,
          wearOsVersion: null,
          packageName: null,
          minSdk: null,
          maxSdk: null,
          targetSdk: null,
        });
      }

      setErrors({ ...errors, apk: undefined });
    } catch (error: any) {
      console.error("Error uploading APK:", error);
      let errorMessage = "Ошибка загрузки APK";
      
      // Показываем конкретное сообщение об ошибке, если оно есть
      if (error.errors && error.errors.file) {
        errorMessage = Array.isArray(error.errors.file) 
          ? error.errors.file[0] 
          : error.errors.file;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setErrors({ ...errors, apk: errorMessage });
    }
  }

  async function handleSave() {
    setSaving(true);
    setErrors({});

    // Validation
    const newErrors: any = {};
    if (!title.trim()) {
      newErrors.title = "Название обязательно";
    }
    if (!description.trim()) {
      newErrors.description = "Описание обязательно";
    }
    
    // Проверка цены для платных приложений
    if (isPaid) {
      if (!canPublishPaidApps) {
        newErrors.appType = "Для публикации платных приложений необходимо подтверждение администратором и наличие платежных данных";
      } else if (!price || parseFloat(price) <= 0) {
        newErrors.price = "Цена должна быть положительным числом";
      }
    }
    
    // Валидация скидки
    if (isPaid && hasDiscount) {
      if (!discountPercent || parseFloat(discountPercent) < 1 || parseFloat(discountPercent) > 99) {
        newErrors.discount = "Процент скидки должен быть от 1 до 99";
      }
      if (!discountStartAt) {
        newErrors.discount = "Дата начала скидки обязательна";
      }
      if (!discountEndAt) {
        newErrors.discount = "Дата окончания скидки обязательна";
      }
      if (discountStartAt && discountEndAt) {
        const startDate = new Date(discountStartAt);
        const endDate = new Date(discountEndAt);
        if (endDate <= startDate) {
          newErrors.discount = "Дата окончания должна быть после даты начала";
        }
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 1 || daysDiff > 7) {
          newErrors.discount = "Скидка может действовать от 1 до 7 дней";
        }
      }
    }
    
    if (!categoryId) {
      newErrors.category = "Категория обязательна";
    }
    if (!iconUploadId) {
      newErrors.icon = "Иконка обязательна";
    }
    if (screenshots.length < 4) {
      newErrors.screenshots = "Необходимо загрузить минимум 4 скриншота";
    }
    if (screenshots.length > 8) {
      newErrors.screenshots = "Максимум 8 скриншотов";
    }
    if (!apkUploadId) {
      newErrors.apk = "APK файл обязателен";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSaving(false);
      return;
    }

    try {
      let watchface;

      if (watchfaceId) {
        // Update existing watchface
        watchface = await apiFetch(`/dev/watchfaces/${watchfaceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            price: isPaid ? Math.round(parseFloat(price)) : 0, // Price in rubles (integer)
            is_free: !isPaid,
            type: appType, // app или watchface
            categories: categoryId ? [categoryId] : [],
            discount_percent: hasDiscount && discountPercent ? parseInt(discountPercent) : null,
            discount_start_at: hasDiscount && discountStartAt ? discountStartAt : null,
            discount_end_at: hasDiscount && discountEndAt ? discountEndAt : null,
          }),
        });
      } else {
        // Create new watchface
        watchface = await apiFetch("/dev/watchfaces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            price: isPaid ? Math.round(parseFloat(price)) : 0, // Price in rubles (integer)
            is_free: !isPaid,
            type: appType, // app или watchface
            categories: categoryId ? [categoryId] : [],
            discount_percent: hasDiscount && discountPercent ? parseInt(discountPercent) : null,
            discount_start_at: hasDiscount && discountStartAt ? discountStartAt : null,
            discount_end_at: hasDiscount && discountEndAt ? discountEndAt : null,
          }),
        });

        if (watchface && watchface.watchface) {
          setWatchfaceId(watchface.watchface.id);
        }
      }

      // Attach files
      if (watchface && watchface.watchface) {
        const filesToAttach: any[] = [];

        // Icon
        if (iconUploadId) {
          filesToAttach.push({
            upload_id: iconUploadId,
            type: "icon",
            sort_order: 0,
          });
        }

        // Screenshots (сохраняем в порядке, в котором они расположены)
        screenshots.forEach((screenshot, index) => {
          if (screenshot.uploadId) {
            filesToAttach.push({
              upload_id: screenshot.uploadId,
              type: "screenshot",
              sort_order: index, // Начинаем с 0, так как icon имеет sort_order 0
            });
          }
        });

        // APK
        if (apkUploadId) {
          filesToAttach.push({
            upload_id: apkUploadId,
            type: "apk",
            sort_order: 999,
          });
        }

        if (filesToAttach.length > 0) {
          await apiFetch(`/dev/watchfaces/${watchface.watchface.id}/files`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              files: filesToAttach,
            }),
          });
        }
      }

      setIsSaved(true);
      alert("Изменения сохранены");
    } catch (error: any) {
      console.error("Error saving watchface:", error);
      const errorMessage = error.message || "Ошибка сохранения";
      alert(errorMessage);
      setErrors({ ...errors, general: errorMessage });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!watchfaceId || !isSaved) {
      alert("Сначала сохраните изменения");
      return;
    }

    setPublishing(true);

    try {
      await apiFetch(`/dev/watchfaces/${watchfaceId}/publish`, {
        method: "POST",
      });

      alert("Приложение опубликовано");
      router.push("/dev/watchfaces");
    } catch (error: any) {
      console.error("Error publishing watchface:", error);
      alert("Ошибка публикации");
    } finally {
      setPublishing(false);
    }
  }

  function handleCancel() {
    if (confirm("Вы уверены, что хотите отменить? Все несохраненные изменения будут потеряны.")) {
      router.push("/dev/watchfaces");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Загрузка {appType === "app" ? "приложения" : "циферблата"}
          </h1>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
              {errors.general}
        </div>
      )}

          <div className="space-y-6">
            {/* Icon */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Иконка <span className="text-red-600 dark:text-red-400">*</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">(512x512 PNG)</span>
              </label>
              <input
                ref={iconInputRef}
                type="file"
                accept="image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleIconUpload(file);
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                {iconPreview ? (
                  <div className="relative">
                    <img
                      src={iconPreview}
                      alt="Icon preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIconPreview(null);
                        setIconUploadId(null);
                        setIconFile(null);
                        if (iconInputRef.current) {
                          iconInputRef.current.value = "";
                        }
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500 text-xs">Нет иконки</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  disabled={uploadingIcon}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadingIcon ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    "Загрузить иконку"
                  )}
                </button>
              </div>
              {errors.icon && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.icon}</p>
              )}
            </div>

            {/* App Type Selection */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Тип <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="appType"
                    value="app"
                    checked={appType === "app"}
                    onChange={(e) => {
                      setAppType(e.target.value as "app" | "watchface");
                      setErrors({ ...errors, appType: undefined });
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Приложение</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="appType"
                    value="watchface"
                    checked={appType === "watchface"}
                    onChange={(e) => {
                      setAppType(e.target.value as "app" | "watchface");
                      setErrors({ ...errors, appType: undefined });
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Циферблат</span>
                </label>
              </div>
              {errors.appType && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.appType}</p>
              )}
            </div>

            {/* Title */}
        <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Название {appType === "app" ? "приложения" : "циферблата"} <span className="text-red-600 dark:text-red-400">*</span>
              </label>
          <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({ ...errors, title: undefined });
                }}
                placeholder="Введите название"
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  errors.title
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
                required
              />
              {errors.title && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Описание <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: undefined });
                }}
                placeholder="Введите описание"
                rows={6}
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all resize-none ${
                  errors.description
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
            required
          />
              {errors.description && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.description}</p>
              )}
        </div>

            {/* Paid/Free Radio */}
        <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Тип приложения <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="appType"
                    checked={!isPaid}
                    onChange={() => {
                      setIsPaid(false);
                      setPrice("0");
                      setErrors({ ...errors, price: undefined, appType: undefined });
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Бесплатное</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
          <input
                    type="radio"
                    name="appType"
                    checked={isPaid}
                    onChange={() => {
                      setIsPaid(true);
                      setPrice("");
                      setErrors({ ...errors, price: undefined, appType: undefined });
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    disabled={!canPublishPaidApps}
                  />
                  <span className={`${!canPublishPaidApps ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    Платное
                  </span>
                </label>
              </div>
              {isPaid && !canPublishPaidApps && (
                <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Для публикации платных приложений необходимо:
                  </p>
                  <ul className="text-yellow-800 dark:text-yellow-200 text-sm mt-1 list-disc list-inside">
                    {!user?.developer_verified_by_admin && (
                      <li>Подтверждение аккаунта администратором</li>
                    )}
                    {!user?.has_payment_details && (
                      <li>Указание платежных данных в профиле</li>
                    )}
                  </ul>
                </div>
              )}
              {errors.appType && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.appType}</p>
              )}
        </div>

            {/* Price */}
            {isPaid && (
        <div>
                <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                  Цена (₽) <span className="text-red-600 dark:text-red-400">*</span>
                </label>
          <input
            type="number"
                  step="1"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors({ ...errors, price: undefined });
                  }}
                  placeholder="0"
                  disabled={!isPriceFieldEnabled}
                  className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                    errors.price
                      ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                  } ${!isPriceFieldEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  required={isPaid}
                />
                {errors.price && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.price}</p>
                )}
                {isPaid && !isPriceFieldEnabled && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    Для указания цены необходимо подтверждение администратором и наличие платежных данных
                  </p>
                )}
        </div>
            )}

            {/* Discount (только для платных приложений) */}
            {isPaid && isPriceFieldEnabled && (
              <div className="mb-6">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      if (!e.target.checked) {
                        setDiscountPercent("");
                        setDiscountStartAt("");
                        setDiscountEndAt("");
                      }
                      setErrors({ ...errors, discount: undefined });
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    Установить скидку
                  </span>
                </label>
                
                {hasDiscount && (
                  <div className="mt-4 space-y-4 p-4 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 rounded-xl">
                    <div>
                      <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                        Процент скидки (%) <span className="text-red-600 dark:text-red-400">*</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">(от 1 до 99)</span>
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="99"
                        value={discountPercent}
                        onChange={(e) => {
                          setDiscountPercent(e.target.value);
                          setErrors({ ...errors, discount: undefined });
                        }}
                        placeholder="0"
                        className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                          errors.discount
                            ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                        }`}
                        required={hasDiscount}
                      />
                      {price && discountPercent && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          Цена со скидкой: {Math.round(parseFloat(price) * (1 - parseFloat(discountPercent) / 100))} ₽
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                        Дата начала скидки <span className="text-red-600 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={discountStartAt}
                        onChange={(e) => {
                          setDiscountStartAt(e.target.value);
                          setErrors({ ...errors, discount: undefined });
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                          errors.discount
                            ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                        }`}
                        required={hasDiscount}
                      />
                    </div>
                    
                    <div>
                      <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                        Дата окончания скидки <span className="text-red-600 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={discountEndAt}
                        onChange={(e) => {
                          setDiscountEndAt(e.target.value);
                          setErrors({ ...errors, discount: undefined });
                        }}
                        min={discountStartAt || new Date().toISOString().split('T')[0]}
                        className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                          errors.discount
                            ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                            : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                        }`}
                        required={hasDiscount}
                      />
                      {discountStartAt && discountEndAt && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          Длительность: {Math.ceil((new Date(discountEndAt).getTime() - new Date(discountStartAt).getTime()) / (1000 * 60 * 60 * 24))} дней
                        </p>
                      )}
                    </div>
                    
                    {errors.discount && (
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg">
                        <p className="text-red-800 dark:text-red-200 text-sm">{errors.discount}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Category */}
        <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Категория <span className="text-red-600 dark:text-red-400">*</span>
              </label>
          <select
                value={categoryId || ""}
                onChange={(e) => {
                  setCategoryId(e.target.value ? parseInt(e.target.value) : null);
                  setErrors({ ...errors, category: undefined });
                }}
                className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  errors.category
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
            required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
          </select>
              {errors.category && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            {/* Screenshots */}
            <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                Скриншоты <span className="text-red-600 dark:text-red-400">*</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">(4-8 штук, 1920x1080 или 1080x1920 PNG/JPG)</span>
              </label>
              <input
                ref={screenshotInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleScreenshotUpload(file);
                  }
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => screenshotInputRef.current?.click()}
                disabled={screenshots.length >= 8 || uploadingScreenshot}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center gap-2"
              >
                {uploadingScreenshot ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Загрузка...
                  </>
                ) : (
                  `Добавить скриншот (${screenshots.length}/8)`
                )}
              </button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative cursor-move transition-opacity ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <img
                      src={screenshot.thumbnail || screenshot.preview || ""}
                      alt={`Screenshot ${index + 1}`}
                      className={`w-full object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 ${
                        screenshot.orientation === "vertical" ? "aspect-[9/16]" : "aspect-video"
                      }`}
                    />
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10"
                    >
                      ×
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              {screenshots.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Перетащите скриншоты для изменения порядка
                </p>
              )}
              {errors.screenshots && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.screenshots}</p>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                Загружено: {screenshots.length} из 4-8
              </p>
        </div>

            {/* APK */}
        <div>
              <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
                APK файл <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                ref={apkInputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleApkUpload(file);
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => apkInputRef.current?.click()}
                  disabled={uploadingApk}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadingApk ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Загрузка...
                    </>
                  ) : (
                    "Загрузить APK"
                  )}
                </button>
                {apkFile && (
                  <div className="mt-2 p-4 backdrop-blur-sm bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700/30 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{apkFile.name}</span>
                        </div>
                        {(apkInfo.version || apkInfo.minSdk !== null || apkInfo.targetSdk !== null) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {apkInfo.version && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Версия:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{apkInfo.version}</span>
                              </div>
                            )}
                            {apkInfo.minSdk !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Min SDK:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{apkInfo.minSdk}</span>
                              </div>
                            )}
                            {apkInfo.targetSdk !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Target SDK:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{apkInfo.targetSdk}</span>
                              </div>
                            )}
                            {apkInfo.maxSdk !== null && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Max SDK:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{apkInfo.maxSdk}</span>
                              </div>
                            )}
                            {apkInfo.wearOsVersion && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 dark:text-gray-400">Wear OS:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{apkInfo.wearOsVersion}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setApkFile(null);
                          setApkUploadId(null);
                          setApkInfo({ version: null, wearOsVersion: null, packageName: null, minSdk: null, maxSdk: null, targetSdk: null });
                          if (apkInputRef.current) {
                            apkInputRef.current.value = "";
                          }
                        }}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {errors.apk && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.apk}</p>
              )}
        </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!isSaved || publishing || !watchfaceId}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {publishing ? "Публикация..." : "Опубликовать"}
              </button>
        <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
                Отмена
        </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

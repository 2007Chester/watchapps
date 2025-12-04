"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
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
  thumbnail?: string | null;
  orientation?: "horizontal" | "vertical"; // Горизонтальный (1920x1080) или вертикальный (1080x1920)
};

type ApkInfo = {
  version: string | null;
  wearOsVersion: string | null;
  packageName: string | null;
};

export default function EditWatchfacePage() {
  const router = useRouter();
  const params = useParams();
  const watchfaceId = params?.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<string>("draft"); // draft или published

  // Form fields
  const [appType, setAppType] = useState<"app" | "watchface">("app");
  const [isPaid, setIsPaid] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountStartAt, setDiscountStartAt] = useState("");
  const [discountEndAt, setDiscountEndAt] = useState("");
  const [lastDiscountEndAt, setLastDiscountEndAt] = useState<string | null>(null);
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

  // Load watchface data, categories and user data
  useEffect(() => {
    if (watchfaceId) {
      loadWatchface();
    }
    loadCategories();
    loadUserData();
  }, [watchfaceId]);

  async function loadWatchface() {
    if (!watchfaceId) return;
    
    try {
      const data = await apiFetch(`/dev/watchfaces/${watchfaceId}`);
      const watchface = data.watchface || data;
      
      // Заполняем форму данными
      setTitle(watchface.title || "");
      setDescription(watchface.description || "");
      setAppType(watchface.type || "app");
      setIsPaid(!watchface.is_free);
      setPrice(watchface.price ? watchface.price.toString() : "");
      setCategoryId(watchface.categories?.[0]?.id || null);
      setStatus(watchface.status || "draft");
      
      // Загружаем данные о скидке
      if (watchface.discount_price && watchface.discount_start_at && watchface.discount_end_at) {
        setHasDiscount(true);
        // Вычисляем процент скидки из цены и discount_price
        const regularPrice = watchface.price || 0;
        const discountPrice = watchface.discount_price || 0;
        if (regularPrice > 0) {
          const percent = Math.round((1 - discountPrice / regularPrice) * 100);
          setDiscountPercent(percent.toString());
        }
        setDiscountStartAt(watchface.discount_start_at.split('T')[0]);
        setDiscountEndAt(watchface.discount_end_at.split('T')[0]);
      }
      
      // Сохраняем дату окончания последней скидки (если она уже закончилась)
      if (watchface.last_discount_end_at) {
        setLastDiscountEndAt(watchface.last_discount_end_at);
      } else if (watchface.discount_end_at) {
        const endDate = new Date(watchface.discount_end_at);
        if (endDate < new Date()) {
          setLastDiscountEndAt(watchface.discount_end_at);
        }
      }
      
      // Загружаем файлы
      if (watchface.files) {
        // Иконка
        const iconFile = watchface.files.find((f: any) => f.type === "icon");
        if (iconFile) {
          setIconUploadId(iconFile.upload_id);
          setIconPreview(iconFile.url || iconFile.upload?.url || null);
        }
        
        // Скриншоты
        const screenshotFiles = watchface.files
          .filter((f: any) => f.type === "screenshot")
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
        
        // Загружаем скриншоты и определяем их ориентацию
        const loadedScreenshotsPromises = screenshotFiles.map(async (f: any) => {
          const url = f.url || f.upload?.url || null;
          let orientation: "horizontal" | "vertical" = "horizontal";
          
          if (url) {
            try {
              orientation = await getImageOrientationFromUrl(url);
            } catch (e) {
              console.error("Error determining orientation:", e);
            }
          }
          
          return {
            id: f.id,
            file: null,
            preview: url,
            uploadId: f.upload_id,
            thumbnail: url,
            orientation: orientation,
          };
        });
        
        const loadedScreenshots = await Promise.all(loadedScreenshotsPromises);
        setScreenshots(loadedScreenshots);
        
        // APK
        const apkFile = watchface.files.find((f: any) => f.type === "apk");
        if (apkFile) {
          setApkUploadId(apkFile.upload_id);
          // Можно попробовать загрузить информацию об APK
        }
      }
      
      setIsSaved(true);
    } catch (error: any) {
      console.error("Error loading watchface:", error);
      alert("Ошибка загрузки данных приложения");
      router.push("/dev/dashboard");
    } finally {
      setLoading(false);
    }
  }

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
    } catch (error) {
      console.error("Error loading user data:", error);
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
        const isValid = img.width === 512 && img.height === 512;
        if (!isValid) {
          alert("Иконка должна быть 512x512 пикселей");
        }
        resolve(isValid);
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
        const isValid = 
          (img.width === 1920 && img.height === 1080) ||
          (img.width === 1080 && img.height === 1920);
        if (!isValid) {
          alert("Скриншот должен быть 1920x1080 или 1080x1920 пикселей");
        }
        resolve(isValid);
      };
      img.onerror = () => {
        alert("Ошибка загрузки изображения");
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Resize image function
  function resizeImage(file: File, maxWidth: number = 400, maxHeight: number = 300): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Не удалось создать canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
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

  async function handleIconUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Иконка должна быть изображением");
      return;
    }

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

  // Функция для определения ориентации изображения
  function getImageOrientation(file: File): Promise<"horizontal" | "vertical"> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const orientation = img.width > img.height ? "horizontal" : "vertical";
        resolve(orientation);
      };
      img.onerror = () => {
        // По умолчанию горизонтальная ориентация
        resolve("horizontal");
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Функция для определения ориентации по URL изображения
  function getImageOrientationFromUrl(url: string): Promise<"horizontal" | "vertical"> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const orientation = img.width > img.height ? "horizontal" : "vertical";
        resolve(orientation);
      };
      img.onerror = () => {
        resolve("horizontal");
      };
      img.src = url;
    });
  }

  async function handleScreenshotUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Скриншот должен быть изображением");
      return;
    }

    const isValid = await validateScreenshotDimensions(file);
    if (!isValid) {
      return;
    }

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

      // Определяем ориентацию
      const orientation = await getImageOrientation(file);
      const thumbnail = await resizeImage(file, 400, 300);

      const newScreenshot: Screenshot = {
        id: null,
        file: file,
        preview: uploadData.url,
        uploadId: uploadData.id,
        thumbnail: thumbnail,
        orientation: orientation,
      };

      setScreenshots([...screenshots, newScreenshot]);
      setErrors({ ...errors, screenshots: undefined });
    } catch (error: any) {
      console.error("Error uploading screenshot:", error);
      let errorMessage = "Ошибка загрузки скриншота";
      
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

  function removeScreenshot(index: number) {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  }

  // Drag-and-drop functions
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
    if (!file.name.endsWith(".apk")) {
      alert("Файл должен быть APK");
      return;
    }

    setUploadingApk(true);
    setErrors({ ...errors, apk: undefined });

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
          });
        }
      } catch (parseError) {
        console.error("Error parsing APK:", parseError);
        setApkInfo({
          version: null,
          wearOsVersion: null,
          packageName: null,
        });
      }

      setErrors({ ...errors, apk: undefined });
    } catch (error: any) {
      console.error("Error uploading APK:", error);
      let errorMessage = "Ошибка загрузки APK";
      
      if (error.errors && error.errors.file) {
        errorMessage = Array.isArray(error.errors.file) 
          ? error.errors.file[0] 
          : error.errors.file;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setErrors({ ...errors, apk: errorMessage });
    } finally {
      setUploadingApk(false);
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
      if (lastDiscountEndAt) {
        const lastEnd = new Date(lastDiscountEndAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastEnd.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 30) {
          newErrors.discount = `Скидка может устанавливаться не чаще одного раза в месяц. Следующая доступна через ${30 - diffDays} дней.`;
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
      // Update watchface
      const watchface = await apiFetch(`/dev/watchfaces/${watchfaceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            title,
            description,
            price: isPaid ? Math.round(parseFloat(price)) : 0,
            is_free: !isPaid,
            type: appType,
            categories: categoryId ? [categoryId] : [],
            discount_percent: hasDiscount && discountPercent ? parseInt(discountPercent) : null,
            discount_start_at: hasDiscount && discountStartAt ? discountStartAt : null,
            discount_end_at: hasDiscount && discountEndAt ? discountEndAt : null,
          }),
      });

      // Attach files (только новые файлы, которые были загружены)
      if (watchface && watchface.watchface) {
        const filesToAttach: any[] = [];

        // Icon (только если была загружена новая)
        if (iconUploadId && iconFile) {
          filesToAttach.push({
            upload_id: iconUploadId,
            type: "icon",
            sort_order: 0,
          });
        }

        // Screenshots (только новые, которые были загружены)
        screenshots.forEach((screenshot, index) => {
          if (screenshot.uploadId && screenshot.file) {
            // Это новый скриншот (есть file)
            filesToAttach.push({
              upload_id: screenshot.uploadId,
              type: "screenshot",
              sort_order: index,
            });
          } else if (screenshot.uploadId && screenshot.id) {
            // Это существующий скриншот, нужно обновить sort_order
            // Пока пропускаем, так как API может не поддерживать обновление sort_order отдельно
          }
        });

        // APK (только если был загружен новый)
        if (apkUploadId && apkFile) {
          filesToAttach.push({
            upload_id: apkUploadId,
            type: "apk",
            sort_order: 0,
          });
        }

        // Attach all new files at once
        if (filesToAttach.length > 0) {
          await apiFetch(`/dev/watchfaces/${watchfaceId}/files`, {
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
      alert("Изменения сохранены!");
      router.push("/dev/dashboard");
    } catch (error: any) {
      console.error("Error saving watchface:", error);
      alert(error.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!watchfaceId) return;
    
    setPublishing(true);
    try {
      await apiFetch(`/dev/watchfaces/${watchfaceId}/publish`, {
        method: "POST",
      });
      setStatus("published");
      alert("Приложение опубликовано!");
    } catch (error: any) {
      console.error("Error publishing watchface:", error);
      alert(error.message || "Ошибка публикации");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!watchfaceId) return;
    
    if (!confirm("Вы уверены, что хотите снять приложение с публикации?")) {
      return;
    }
    
    setUnpublishing(true);
    try {
      await apiFetch(`/dev/watchfaces/${watchfaceId}/unpublish`, {
        method: "POST",
      });
      setStatus("draft");
      alert("Приложение снято с публикации");
    } catch (error: any) {
      console.error("Error unpublishing watchface:", error);
      alert(error.message || "Ошибка снятия с публикации");
    } finally {
      setUnpublishing(false);
    }
  }

  async function handleDelete() {
    if (!watchfaceId) return;
    
    const confirmMessage = status === "published"
      ? "Вы уверены, что хотите удалить опубликованное приложение? Это действие нельзя отменить!"
      : "Вы уверены, что хотите удалить приложение? Это действие нельзя отменить!";
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Дополнительное подтверждение для опубликованных
    if (status === "published") {
      const secondConfirm = prompt("Для подтверждения удаления введите название приложения:");
      if (secondConfirm !== title) {
        alert("Название не совпадает. Удаление отменено.");
        return;
      }
    }
    
    setDeleting(true);
    try {
      await apiFetch(`/dev/watchfaces/${watchfaceId}`, {
        method: "DELETE",
      });
      alert("Приложение удалено");
      router.push("/dev/dashboard");
    } catch (error: any) {
      console.error("Error deleting watchface:", error);
      alert(error.message || "Ошибка удаления");
      setDeleting(false);
    }
  }

  function handleCancel() {
    router.push("/dev/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const developerVerifiedByAdmin = user?.developer_verified_by_admin || false;
  const hasPaymentDetails = user?.has_payment_details || false;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-800/30 rounded-2xl p-8 shadow-2xl shadow-black/10 dark:shadow-black/30">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Редактирование {appType === "app" ? "приложения" : "циферблата"}
          </h1>

          {/* App Type Selection */}
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              Тип контента <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="appType"
                  value="app"
                  checked={appType === "app"}
                  onChange={() => setAppType("app")}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Приложение</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="appType"
                  value="watchface"
                  checked={appType === "watchface"}
                  onChange={() => setAppType("watchface")}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Циферблат</span>
              </label>
            </div>
          </div>

          {/* Icon Upload */}
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              Иконка <span className="text-red-600 dark:text-red-400">*</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">(512x512 PNG/JPG)</span>
            </label>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleIconUpload(file);
              }}
              className="hidden"
            />
            <div className="flex items-center gap-4">
              {iconPreview && (
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="w-24 h-24 rounded-xl border-2 border-gray-300 dark:border-gray-600 object-cover"
                />
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
                  iconPreview ? "Заменить иконку" : "Загрузить иконку"
                )}
              </button>
            </div>
            {errors.icon && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.icon}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
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
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              Описание <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: undefined });
              }}
              placeholder="Опишите ваше приложение"
              rows={6}
              className={`w-full backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all resize-y ${
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

          {/* Price / Free selection */}
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              Тип цены <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="priceType"
                  checked={!isPaid}
                  onChange={() => setIsPaid(false)}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Бесплатное</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="priceType"
                  checked={isPaid}
                  onChange={() => setIsPaid(true)}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Платное</span>
              </label>
            </div>
          </div>

          {isPaid && (
            <div className="mb-6">
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
                  !isPriceFieldEnabled ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  errors.price
                    ? "border-red-400/50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-white/30 dark:border-gray-700/30 focus:border-blue-400/50 focus:ring-blue-500/20"
                }`}
                required={isPaid}
              />
              {errors.price && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.price}</p>
              )}
              {isPaid && !developerVerifiedByAdmin && (
                <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                  ⚠️ Для публикации платных приложений ваш аккаунт должен быть подтвержден администратором.
                </p>
              )}
              {isPaid && developerVerifiedByAdmin && !hasPaymentDetails && (
                <p className="text-yellow-600 dark:text-yellow-400 text-xs mt-1">
                  ⚠️ Для публикации платных приложений необходимо заполнить платежные данные в профиле.
                </p>
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
                  {/* Информация о последней скидке */}
                  {lastDiscountEndAt && (() => {
                    const lastEnd = new Date(lastDiscountEndAt);
                    const now = new Date();
                    const daysSince = Math.floor((now.getTime() - lastEnd.getTime()) / (1000 * 60 * 60 * 24));
                    const daysRemaining = 30 - daysSince;
                    if (daysRemaining > 0) {
                      return (
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg">
                          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                            ⚠️ Последняя скидка закончилась {daysSince} дней назад. Следующую скидку можно установить через {daysRemaining} дней.
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
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
          <div className="mb-6">
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
          <div className="mb-6">
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
                if (file) handleScreenshotUpload(file);
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
          </div>

          {/* APK */}
          <div className="mb-6">
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium block mb-2">
              APK файл <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              ref={apkInputRef}
              type="file"
              accept=".apk"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleApkUpload(file);
              }}
              className="hidden"
            />
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
                apkFile ? "Заменить APK" : "Загрузить APK"
              )}
            </button>
            {apkFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {apkFile.name}
                {apkInfo.version && ` (версия: ${apkInfo.version})`}
                {apkInfo.wearOsVersion && ` - ${apkInfo.wearOsVersion}`}
              </p>
            )}
            {errors.apk && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.apk}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 mt-8">
            {/* Основные кнопки */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || publishing || unpublishing || deleting}
                className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all ${
                  saving || publishing || unpublishing || deleting
                    ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                    : "backdrop-blur-sm bg-gradient-to-r from-blue-500/90 to-purple-500/90 dark:from-blue-600/90 dark:to-purple-600/90 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 border border-white/20"
                }`}
              >
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </button>
              
              {/* Кнопка публикации/снятия с публикации */}
              {status === "published" ? (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={!isSaved || unpublishing || publishing || deleting}
                  className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all ${
                    !isSaved || unpublishing || publishing || deleting
                      ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                      : "backdrop-blur-sm bg-gradient-to-r from-yellow-500/90 to-orange-500/90 dark:from-yellow-600/90 dark:to-orange-600/90 hover:from-yellow-600 hover:to-orange-600 dark:hover:from-yellow-500 dark:hover:to-orange-500 active:scale-95 shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 border border-white/20"
                  }`}
                >
                  {unpublishing ? "Снятие с публикации..." : "Снять с публикации"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!isSaved || publishing || unpublishing || deleting || (!canPublishPaidApps && isPaid)}
                  className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all ${
                    !isSaved || publishing || unpublishing || deleting || (!canPublishPaidApps && isPaid)
                      ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                      : "backdrop-blur-sm bg-gradient-to-r from-emerald-500/90 to-teal-500/90 dark:from-emerald-600/90 dark:to-teal-600/90 hover:from-emerald-600 hover:to-teal-600 dark:hover:from-emerald-500 dark:hover:to-teal-500 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 border border-white/20"
                  }`}
                >
                  {publishing ? "Публикация..." : "Опубликовать"}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || publishing || unpublishing || deleting}
                className={`flex-1 py-3 rounded-xl text-gray-700 dark:text-gray-300 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 font-semibold transition-all active:scale-95 border border-white/30 dark:border-gray-700/30 shadow-md hover:shadow-lg ${
                  saving || publishing || unpublishing || deleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Отмена
              </button>
            </div>
            
            {/* Кнопка удаления */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || publishing || unpublishing || deleting}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
                saving || publishing || unpublishing || deleting
                  ? "bg-gray-400/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
                  : "backdrop-blur-sm bg-gradient-to-r from-red-500/90 to-red-600/90 dark:from-red-600/90 dark:to-red-700/90 hover:from-red-600 hover:to-red-700 dark:hover:from-red-500 dark:hover:to-red-600 active:scale-95 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 border border-white/20"
              }`}
            >
              {deleting ? "Удаление..." : "Удалить приложение"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

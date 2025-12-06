"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, getToken } from "@/lib/api";

// Тип для watchface
type Watchface = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  is_free: boolean;
  version: string | null;
  min_sdk: number | null;
  target_sdk: number | null;
  max_sdk: number | null;
  wear_os_version: string | null;
  type: "watchface" | "app";
  status: string;
  files?: Array<{
    id: number;
    type: string;
    url: string;
    upload?: {
      url: string;
      original_name: string;
    };
  }>;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
};

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

// Простое модальное окно, которое показываем, если пользователь не залогинен.
function LoginRequiredModal({ open, onClose }: LoginModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-white">
          Войдите, чтобы купить циферблат
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Для покупки и установки циферблата необходимо войти в аккаунт или
          зарегистрироваться.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
            onClick={() => {
              router.push("/login");
            }}
          >
            Войти
          </button>
          <button
            className="w-full rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:border-gray-400"
            onClick={() => {
              router.push("/register");
            }}
          >
            Регистрация
          </button>
        </div>

        <button
          className="mt-3 w-full text-center text-xs text-gray-500 hover:text-gray-300"
          onClick={onClose}
        >
          Отменить
        </button>
      </div>
    </div>
  );
}

export default function WatchfacePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [watchface, setWatchface] = useState<Watchface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: заменить на реальное состояние авторизации (token/role из useAuth)
  const isLoggedIn = false;

  useEffect(() => {
    async function fetchWatchface() {
      try {
        setLoading(true);
        const data = await apiFetch(`/watchface/${slug}`);
        setWatchface(data);
      } catch (err: any) {
        setError(err.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchWatchface();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error || !watchface) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400">{error || "Приложение не найдено"}</div>
      </div>
    );
  }

  const handleBuyClick = () => {
    if (!isLoggedIn) {
      // Пользователь не авторизован – показываем окно
      setShowLoginModal(true);
      return;
    }

    // Если авторизован – перенаправляем на страницу покупки
    // TODO: сделать реальный маршрут покупки /purchase/[slug]
    // router.push(`/purchase/${slug}`);
  };

  return (
    <div className="space-y-6">
      <LoginRequiredModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Хлебные крошки */}
      <div className="text-xs text-gray-400">
        <Link href="/catalog" className="hover:text-gray-200">
          Каталог
        </Link>{" "}
        / <span className="text-gray-300">{watchface.title}</span>
      </div>

      {/* Основной блок: слева превью, справа информация */}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          {(() => {
            // Ищем banner или icon для отображения
            const banner = watchface.files?.find(f => f.type === 'banner');
            const icon = watchface.files?.find(f => f.type === 'icon');
            const imageUrl = banner?.url || icon?.url || banner?.upload?.url || icon?.upload?.url;
            
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={watchface.title}
                className="aspect-square w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-gray-700 to-black" />
            );
          })()}
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-semibold">{watchface.title}</h1>

          <p className="text-sm text-gray-300">{watchface.description}</p>

          {/* Информация о версии и совместимости */}
          {(watchface.version || watchface.wear_os_version || watchface.min_sdk !== null) && (
            <div className="mt-3 space-y-2 rounded-xl border border-gray-700/50 bg-gray-800/30 p-4">
              <h3 className="text-sm font-semibold text-gray-300">Информация о приложении</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {watchface.version && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Версия:</span>
                    <span className="font-semibold text-white">{watchface.version}</span>
                  </div>
                )}
                {watchface.wear_os_version && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Wear OS:</span>
                    <span className="font-semibold text-white">{watchface.wear_os_version}</span>
                  </div>
                )}
                {watchface.min_sdk !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Min SDK:</span>
                    <span className="font-semibold text-white">{watchface.min_sdk}</span>
                  </div>
                )}
                {watchface.target_sdk !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Target SDK:</span>
                    <span className="font-semibold text-white">{watchface.target_sdk}</span>
                  </div>
                )}
                {watchface.max_sdk !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Max SDK:</span>
                    <span className="font-semibold text-white">{watchface.max_sdk}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Цена */}
          <div className="mt-3 flex items-baseline gap-2">
            {watchface.is_free ? (
              <span className="text-2xl font-bold text-green-400">Бесплатно</span>
            ) : (
              <>
                {watchface.discount_price && watchface.discount_price < watchface.price ? (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {watchface.price} ₽
                    </span>
                    <span className="text-2xl font-bold text-green-400">
                      {watchface.discount_price} ₽
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-green-400">
                    {watchface.price} ₽
                  </span>
                )}
              </>
            )}
          </div>

          {/* Кнопки */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
              onClick={handleBuyClick}
            >
              Купить и установить
            </button>
            <button className="flex-1 rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:border-gray-400">
              Добавить в избранное
            </button>
          </div>

          {/* Доп. инфо: теги/фичи – пока статично */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
            <span className="rounded-full border border-gray-700 px-2 py-1">
              Analog
            </span>
            <span className="rounded-full border border-gray-700 px-2 py-1">
              AOD
            </span>
            <span className="rounded-full border border-gray-700 px-2 py-1">
              Complications
            </span>
          </div>
        </div>
      </div>

      {/* Секция отзывов */}
      <ReviewsSection watchfaceId={watchface.id} />
    </div>
  );
}

// Компонент секции отзывов
type Review = {
  id: number;
  rating: number;
  comment: string | null;
  user: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  reply: {
    id: number;
    reply: string;
    developer: {
      id: number;
      name: string;
    } | null;
    created_at: string;
  } | null;
};

type ReviewsData = {
  ratings: Review[];
  average_rating: number | null;
  rating_count: number;
};

function ReviewsSection({ watchfaceId }: { watchfaceId: number }) {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Проверяем авторизацию
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    loadReviews();
  }, [watchfaceId]);

  async function loadReviews() {
    try {
      setLoading(true);
      const data = await apiFetch(`/watchface/${watchfaceId}/ratings`);
      setReviewsData(data);
    } catch (err: any) {
      console.error("Error loading reviews:", err);
      setError(err.message || "Ошибка загрузки отзывов");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch(`/watchface/${watchfaceId}/ratings`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment || null }),
      });
      setShowForm(false);
      setComment("");
      setRating(5);
      loadReviews();
    } catch (err: any) {
      setError(err.message || "Ошибка при отправке отзыва");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-xl border border-gray-700/50 bg-gray-800/30 p-6">
        <div className="text-center text-gray-400">Загрузка отзывов...</div>
      </div>
    );
  }

  if (!reviewsData) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Отзывы</h2>
        {reviewsData.average_rating !== null && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(reviewsData.average_rating!)
                      ? "text-yellow-400"
                      : "text-gray-600"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-lg font-semibold">
              {reviewsData.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({reviewsData.rating_count})
            </span>
          </div>
        )}
      </div>

      {/* Форма добавления отзыва */}
      {!showForm ? (
        <button
          onClick={() => {
            if (!isLoggedIn) {
              router.push("/login");
              return;
            }
            setShowForm(true);
          }}
          className="w-full rounded-xl border border-gray-700/50 bg-gray-800/30 px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/50 transition-colors"
        >
          {isLoggedIn ? "Написать отзыв" : "Войдите, чтобы оставить отзыв"}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Оценка
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${
                    star <= rating ? "text-yellow-400" : "text-gray-600"
                  } hover:text-yellow-400 transition-colors`}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Комментарий (необязательно)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="Оставьте свой отзыв..."
            />
            <div className="mt-1 text-xs text-gray-500">
              {comment.length}/1000
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Отправка..." : "Отправить отзыв"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setComment("");
                setRating(5);
                setError(null);
              }}
              className="rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-400"
            >
              Отменить
            </button>
          </div>
        </form>
      )}

      {/* Список отзывов */}
      {reviewsData.ratings.length === 0 ? (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 text-center text-gray-400">
          Пока нет отзывов. Будьте первым!
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsData.ratings.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {review.user?.name || "Анонимный пользователь"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.created_at).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm text-gray-300">{review.comment}</p>
              )}

              {/* Ответ разработчика */}
              {review.reply && (
                <div className="mt-4 ml-4 rounded-lg border-l-4 border-blue-500 bg-blue-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-blue-300">
                      Ответ разработчика:
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.reply.created_at).toLocaleDateString("ru-RU", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{review.reply.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

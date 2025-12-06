"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type Review = {
  id: number;
  watchface: {
    id: number;
    title: string;
    slug: string;
  };
  rating: number;
  comment: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
  created_at_human: string;
  reply: {
    id: number;
    reply: string;
    developer: {
      id: number;
      name: string;
    } | null;
    created_at: string;
    created_at_human: string;
  } | null;
};

type ReviewsData = {
  reviews: Review[];
  statistics: {
    total_reviews: number;
    average_rating: number | null;
    rating_distribution: Record<number, number>;
  };
};

export default function ReviewsPage() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWatchface, setSelectedWatchface] = useState<number | null>(null);
  const [watchfaces, setWatchfaces] = useState<Array<{ id: number; title: string }>>([]);

  useEffect(() => {
    loadWatchfaces();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [selectedWatchface]);

  async function loadWatchfaces() {
    try {
      const data = await apiFetch("/dev/watchfaces");
      const items = data.items || data.watchfaces || [];
      setWatchfaces(items);
    } catch (err: any) {
      console.error("Error loading watchfaces:", err);
    }
  }

  async function loadReviews() {
    setLoading(true);
    setError(null);

    try {
      const url = selectedWatchface
        ? `/dev/reviews?watchface_id=${selectedWatchface}`
        : "/dev/reviews";
      const data = await apiFetch(url);
      setReviewsData(data);
    } catch (err: any) {
      console.error("Error loading reviews:", err);
      setError(err.message || "Ошибка загрузки отзывов");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !reviewsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка отзывов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !reviewsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!reviewsData) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Отзывы на приложения
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Все отзывы пользователей на ваши приложения и циферблаты
        </p>
      </div>

      {/* Фильтр по приложению */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Фильтр по приложению
        </label>
        <select
          value={selectedWatchface || ""}
          onChange={(e) => setSelectedWatchface(e.target.value ? parseInt(e.target.value) : null)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Все приложения</option>
          {watchfaces.map((wf) => (
            <option key={wf.id} value={wf.id}>
              {wf.title}
            </option>
          ))}
        </select>
      </div>

      {/* Статистика */}
      {reviewsData.statistics.total_reviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Всего отзывов"
            value={reviewsData.statistics.total_reviews.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Средний рейтинг"
            value={
              reviewsData.statistics.average_rating
                ? `${reviewsData.statistics.average_rating.toFixed(1)} ⭐`
                : "—"
            }
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
            color="yellow"
          />
          <StatCard
            title="5 звезд"
            value={reviewsData.statistics.rating_distribution[5]?.toString() || "0"}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
            color="green"
          />
        </div>
      )}

      {/* Распределение рейтингов */}
      {reviewsData.statistics.total_reviews > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Распределение рейтингов
          </h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData.statistics.rating_distribution[star] || 0;
              const percentage =
                reviewsData.statistics.total_reviews > 0
                  ? (count / reviewsData.statistics.total_reviews) * 100
                  : 0;

              return (
                <div key={star} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {star}
                    </span>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Список отзывов */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 border border-white/20 dark:border-gray-700/30 rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Все отзывы
        </h2>
        {reviewsData.reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedWatchface
                ? "Нет отзывов для выбранного приложения"
                : "Пока нет отзывов на ваши приложения"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsData.reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onReply={() => loadReviews()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewItem({
  review,
  onReply,
}: {
  review: Review;
  onReply: () => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState(review.reply?.reply || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch(
        `/watchface/${review.watchface.id}/ratings/${review.id}/reply`,
        {
          method: "POST",
          body: JSON.stringify({ reply: replyText }),
        }
      );
      setShowReplyForm(false);
      onReply();
    } catch (err: any) {
      setError(err.message || "Ошибка при отправке ответа");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReply() {
    if (!confirm("Удалить ответ?")) return;

    try {
      await apiFetch(
        `/watchface/${review.watchface.id}/ratings/${review.id}/reply`,
        {
          method: "DELETE",
        }
      );
      onReply();
    } catch (err: any) {
      setError(err.message || "Ошибка при удалении ответа");
    }
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/dev/watchfaces/${review.watchface.id}/edit`}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {review.watchface.title}
            </Link>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{review.user?.name || "Анонимный пользователь"}</span>
            <span>•</span>
            <span>{review.created_at_human}</span>
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          {review.comment}
        </p>
      )}

      {/* Ответ разработчика */}
      {review.reply && !showReplyForm && (
        <div className="mt-4 ml-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Ваш ответ:
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {review.reply.created_at_human}
              </span>
            </div>
            <button
              onClick={handleDeleteReply}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              Удалить
            </button>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {review.reply.reply}
          </p>
        </div>
      )}

      {/* Форма ответа */}
      {showReplyForm && (
        <form onSubmit={handleSubmit} className="mt-4 ml-6 space-y-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Напишите ответ пользователю..."
            required
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {replyText.length}/2000
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText(review.reply?.reply || "");
                  setError(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Отменить
              </button>
              <button
                type="submit"
                disabled={submitting || !replyText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Отправка..." : review.reply ? "Обновить" : "Отправить"}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}
        </form>
      )}

      {/* Кнопка ответа */}
      {!review.reply && !showReplyForm && (
        <button
          onClick={() => setShowReplyForm(true)}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Ответить
        </button>
      )}

      {/* Кнопка редактирования ответа */}
      {review.reply && !showReplyForm && (
        <button
          onClick={() => {
            setShowReplyForm(true);
            setReplyText(review.reply!.reply);
          }}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Редактировать ответ
        </button>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
  };

  return (
    <div className={`border rounded-xl p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-80">{title}</h3>
        <div className="opacity-60">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}


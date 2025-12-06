<?php

namespace App\Http\Controllers;

use App\Models\Watchface;
use App\Models\WatchfaceRating;
use Illuminate\Http\Request;

class DeveloperReviewsController extends Controller
{
    /**
     * Получить все отзывы на приложения разработчика
     * GET /api/dev/reviews?watchface_id=1
     */
    public function index(Request $request)
    {
        $developerId = $request->user()->id;

        // Получаем все циферблаты разработчика
        $watchfaceIds = Watchface::where('developer_id', $developerId)
            ->pluck('id');

        $query = WatchfaceRating::whereIn('watchface_id', $watchfaceIds)
            ->with(['watchface:id,title,slug', 'user:id,name,email', 'reply.developer:id,name'])
            ->orderBy('created_at', 'desc');

        // Фильтрация по конкретному приложению
        if ($request->has('watchface_id')) {
            $watchfaceId = (int) $request->query('watchface_id');
            // Проверяем, что это приложение принадлежит разработчику
            if ($watchfaceIds->contains($watchfaceId)) {
                $query->where('watchface_id', $watchfaceId);
            }
        }

        $ratings = $query->get()->map(function ($rating) {
            return [
                'id' => $rating->id,
                'watchface' => [
                    'id' => $rating->watchface->id,
                    'title' => $rating->watchface->title,
                    'slug' => $rating->watchface->slug,
                ],
                'rating' => $rating->rating,
                'comment' => $rating->comment,
                'user' => $rating->user ? [
                    'id' => $rating->user->id,
                    'name' => $rating->user->name,
                    'email' => $rating->user->email,
                ] : null,
                'created_at' => $rating->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $rating->created_at->diffForHumans(),
                'reply' => $rating->reply ? [
                    'id' => $rating->reply->id,
                    'reply' => $rating->reply->reply,
                    'developer' => $rating->reply->developer ? [
                        'id' => $rating->reply->developer->id,
                        'name' => $rating->reply->developer->name,
                    ] : null,
                    'created_at' => $rating->reply->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $rating->reply->created_at->diffForHumans(),
                ] : null,
            ];
        });

        // Статистика по отзывам
        $totalReviews = $ratings->count();
        $averageRating = $ratings->count() > 0
            ? round($ratings->avg('rating'), 1)
            : null;

        // Распределение по рейтингам
        $ratingDistribution = [];
        for ($i = 5; $i >= 1; $i--) {
            $ratingDistribution[$i] = $ratings->where('rating', $i)->count();
        }

        return response()->json([
            'reviews' => $ratings,
            'statistics' => [
                'total_reviews' => $totalReviews,
                'average_rating' => $averageRating,
                'rating_distribution' => $ratingDistribution,
            ],
        ]);
    }
}

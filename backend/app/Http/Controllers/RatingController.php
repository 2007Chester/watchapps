<?php

namespace App\Http\Controllers;

use App\Models\Watchface;
use App\Models\WatchfaceRating;
use App\Models\WatchfaceRatingReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    /**
     * Получить отзывы для циферблата
     * GET /api/watchface/{id}/ratings
     */
    public function index(Request $request, $id)
    {
        $watchface = Watchface::findOrFail($id);

        $ratings = WatchfaceRating::where('watchface_id', $watchface->id)
            ->with(['user:id,name,email', 'reply.developer:id,name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'rating' => $rating->rating,
                    'comment' => $rating->comment,
                    'user' => $rating->user ? [
                        'id' => $rating->user->id,
                        'name' => $rating->user->name,
                    ] : null,
                    'created_at' => $rating->created_at->format('Y-m-d H:i:s'),
                    'reply' => $rating->reply ? [
                        'id' => $rating->reply->id,
                        'reply' => $rating->reply->reply,
                        'developer' => $rating->reply->developer ? [
                            'id' => $rating->reply->developer->id,
                            'name' => $rating->reply->developer->name,
                        ] : null,
                        'created_at' => $rating->reply->created_at->format('Y-m-d H:i:s'),
                    ] : null,
                ];
            });

        // Средний рейтинг
        $averageRating = WatchfaceRating::where('watchface_id', $watchface->id)
            ->avg('rating');

        $ratingCount = $ratings->count();

        return response()->json([
            'ratings' => $ratings,
            'average_rating' => $averageRating ? round($averageRating, 1) : null,
            'rating_count' => $ratingCount,
        ]);
    }

    /**
     * Создать отзыв
     * POST /api/watchface/{id}/ratings
     */
    public function store(Request $request, $id)
    {
        $watchface = Watchface::findOrFail($id);

        // Проверяем, что пользователь авторизован
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Проверяем, не оставлял ли пользователь уже отзыв
        $existingRating = WatchfaceRating::where('watchface_id', $watchface->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingRating) {
            // Обновляем существующий отзыв
            $existingRating->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Отзыв обновлен',
                'rating' => $existingRating->fresh()->load('user:id,name,email'),
            ]);
        }

        // Создаем новый отзыв
        $rating = WatchfaceRating::create([
            'watchface_id' => $watchface->id,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Отзыв добавлен',
            'rating' => $rating->load('user:id,name,email'),
        ], 201);
    }

    /**
     * Удалить отзыв (только свой)
     * DELETE /api/watchface/{id}/ratings/{ratingId}
     */
    public function destroy(Request $request, $id, $ratingId)
    {
        $rating = WatchfaceRating::findOrFail($ratingId);

        // Проверяем, что это отзыв пользователя или разработчик циферблата
        $watchface = Watchface::findOrFail($id);
        
        if ($rating->user_id !== $request->user()->id && $watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $rating->delete();

        return response()->json([
            'success' => true,
            'message' => 'Отзыв удален',
        ]);
    }

    /**
     * Создать или обновить ответ разработчика на отзыв
     * POST /api/watchface/{id}/ratings/{ratingId}/reply
     */
    public function reply(Request $request, $id, $ratingId)
    {
        $watchface = Watchface::findOrFail($id);
        $rating = WatchfaceRating::findOrFail($ratingId);

        // Проверяем, что отзыв относится к этому циферблату
        if ($rating->watchface_id !== $watchface->id) {
            return response()->json(['error' => 'Rating not found for this watchface'], 404);
        }

        // Проверяем, что пользователь - разработчик этого циферблата
        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'reply' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Проверяем, есть ли уже ответ
        $existingReply = WatchfaceRatingReply::where('rating_id', $rating->id)
            ->where('developer_id', $request->user()->id)
            ->first();

        if ($existingReply) {
            // Обновляем существующий ответ
            $existingReply->update([
                'reply' => $request->reply,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ответ обновлен',
                'reply' => $existingReply->fresh()->load('developer:id,name'),
            ]);
        }

        // Создаем новый ответ
        $reply = WatchfaceRatingReply::create([
            'rating_id' => $rating->id,
            'developer_id' => $request->user()->id,
            'reply' => $request->reply,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ответ добавлен',
            'reply' => $reply->load('developer:id,name'),
        ], 201);
    }

    /**
     * Удалить ответ на отзыв
     * DELETE /api/watchface/{id}/ratings/{ratingId}/reply
     */
    public function deleteReply(Request $request, $id, $ratingId)
    {
        $watchface = Watchface::findOrFail($id);
        $rating = WatchfaceRating::findOrFail($ratingId);

        // Проверяем, что пользователь - разработчик этого циферблата
        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $reply = WatchfaceRatingReply::where('rating_id', $rating->id)
            ->where('developer_id', $request->user()->id)
            ->first();

        if (!$reply) {
            return response()->json(['error' => 'Reply not found'], 404);
        }

        $reply->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ответ удален',
        ]);
    }
}

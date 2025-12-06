<?php

namespace App\Http\Controllers;

use App\Models\Watchface;
use App\Models\WatchfaceSale;
use App\Models\WatchfaceDownload;
use App\Models\WatchfaceView;
use App\Models\WatchfaceRating;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DeveloperStatsController extends Controller
{
    /**
     * Общая статистика разработчика
     * GET /api/dev/statistics?month=2025-12
     */
    public function index(Request $request)
    {
        $developerId = $request->user()->id;

        // Параметры периода (по умолчанию текущий месяц)
        $month = $request->query('month');
        if ($month) {
            $startDate = Carbon::parse($month . '-01')->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
        } else {
            $startDate = Carbon::now()->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
        }

        // Получаем все циферблаты разработчика
        $watchfaceIds = Watchface::where('developer_id', $developerId)
            ->pluck('id');

        // Месячный доход (сумма всех продаж за период)
        $monthlyRevenue = WatchfaceSale::whereIn('watchface_id', $watchfaceIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('price');

        // Общее количество продаж за месяц
        $monthlySales = WatchfaceSale::whereIn('watchface_id', $watchfaceIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Общее количество скачиваний за месяц
        $monthlyDownloads = WatchfaceDownload::whereIn('watchface_id', $watchfaceIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Статистика по каждому циферблату
        $watchfacesStats = Watchface::where('developer_id', $developerId)
            ->with(['categories', 'files.upload'])
            ->get()
            ->map(function ($watchface) use ($startDate, $endDate) {
                $views = WatchfaceView::where('watchface_id', $watchface->id)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count();

                $sales = WatchfaceSale::where('watchface_id', $watchface->id)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count();

                $downloads = WatchfaceDownload::where('watchface_id', $watchface->id)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count();

                $revenue = WatchfaceSale::where('watchface_id', $watchface->id)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->sum('price');

                // Рейтинг - средний рейтинг всех отзывов
                $ratings = WatchfaceRating::where('watchface_id', $watchface->id)->get();
                $ratingCount = $ratings->count();
                $rating = $ratingCount > 0
                    ? round($ratings->avg('rating'), 1)
                    : null;

                // Получаем иконку циферблата
                $iconFile = $watchface->files()
                    ->where('type', 'icon')
                    ->first();
                
                $iconUrl = $iconFile ? $iconFile->url : null;

                return [
                    'id' => $watchface->id,
                    'title' => $watchface->title,
                    'slug' => $watchface->slug,
                    'price' => $watchface->price,
                    'is_free' => $watchface->is_free,
                    'status' => $watchface->status,
                    'icon' => $iconUrl,
                    'views' => $views,
                    'sales' => $sales,
                    'downloads' => $downloads,
                    'revenue' => $revenue,
                    'rating' => $rating,
                    'rating_count' => $ratingCount,
                ];
            })
            ->sortByDesc('revenue')
            ->values();

        // График по дням месяца
        $chart = [];
        $cursor = $startDate->copy();
        while ($cursor <= $endDate) {
            $day = $cursor->toDateString();
            
            $dayRevenue = WatchfaceSale::whereIn('watchface_id', $watchfaceIds)
                ->whereDate('created_at', $day)
                ->sum('price');
            
            $daySales = WatchfaceSale::whereIn('watchface_id', $watchfaceIds)
                ->whereDate('created_at', $day)
                ->count();
            
            $dayDownloads = WatchfaceDownload::whereIn('watchface_id', $watchfaceIds)
                ->whereDate('created_at', $day)
                ->count();

            $chart[$day] = [
                'revenue' => (float) $dayRevenue,
                'sales' => $daySales,
                'downloads' => $dayDownloads,
            ];

            $cursor->addDay();
        }

        return response()->json([
            'period' => [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString(),
                'month' => $startDate->format('Y-m'),
            ],
            'summary' => [
                'monthly_revenue' => (float) $monthlyRevenue,
                'monthly_sales' => $monthlySales,
                'monthly_downloads' => $monthlyDownloads,
            ],
            'watchfaces' => $watchfacesStats,
            'chart' => $chart,
        ]);
    }
}

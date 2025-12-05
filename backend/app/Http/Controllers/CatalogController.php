<?php

namespace App\Http\Controllers;

use App\Models\Watchface;
use App\Models\Category;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Топ продаж (позже добавим сортировку по покупкам)
     */
    public function top(Request $request)
    {
        $query = Watchface::where('status', 'published');
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->orderBy('price', 'desc')
            ->take(20)
            ->get();
    }

    /**
     * Новейшие публикации
     */
    public function new(Request $request)
    {
        $query = Watchface::where('status', 'published');
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->orderBy('created_at', 'desc')
            ->take(20)
            ->get();
    }

    /**
     * Скидки
     */
    public function discounts(Request $request)
    {
        $query = Watchface::where('status', 'published')
            ->whereNotNull('discount_price')
            ->where('discount_price', '>', 0)
            ->where(function($q) {
                $q->whereNull('discount_end_at')
                  ->orWhere('discount_end_at', '>=', now());
            });
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->get();
    }

    /**
     * По категории
     */
    public function byCategory(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = $category->watchfaces()
            ->where('status', 'published');
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->get();
    }

    /**
     * Страница товара
     */
    public function show($slug)
    {
        return Watchface::where('slug', $slug)
            ->with(['files', 'categories'])
            ->firstOrFail();
    }
    
    /**
     * Фильтрация по совместимости с часами
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param Request $request
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function filterByCompatibility($query, Request $request)
    {
        // Получаем версию SDK часов из запроса (от Android приложения)
        $deviceSdk = $request->input('device_sdk'); // API level часов
        $deviceWearOsVersion = $request->input('device_wear_os_version'); // Версия Wear OS часов (опционально)
        
        if ($deviceSdk !== null) {
            $deviceSdk = (int)$deviceSdk;
            
            // Фильтруем: min_sdk приложения должен быть <= SDK часов
            // И если есть max_sdk, то он должен быть >= SDK часов
            $query->where(function($q) use ($deviceSdk) {
                $q->where(function($subQ) use ($deviceSdk) {
                    // Если min_sdk не указан, считаем совместимым (старые приложения)
                    $subQ->whereNull('min_sdk')
                         ->orWhere('min_sdk', '<=', $deviceSdk);
                });
                
                // Если есть max_sdk, проверяем, что он >= SDK часов
                $q->where(function($subQ) use ($deviceSdk) {
                    $subQ->whereNull('max_sdk')
                         ->orWhere('max_sdk', '>=', $deviceSdk);
                });
            });
        }
        
        return $query;
    }
}

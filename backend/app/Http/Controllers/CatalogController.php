<?php

namespace App\Http\Controllers;

use App\Models\Watchface;
use App\Models\Category;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * Получить все категории
     */
    public function categories()
    {
        return Category::orderBy('sort_order')->get();
    }

    /**
     * Топ продаж (позже добавим сортировку по покупкам)
     */
    public function top(Request $request)
    {
        $query = Watchface::where('status', 'published')
            ->with(['files.upload', 'categories']);
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->orderBy('price', 'desc')
            ->take(20)
            ->get()
            ->map(function ($watchface) {
                return $this->formatWatchface($watchface);
            });
    }

    /**
     * Новейшие публикации
     */
    public function new(Request $request)
    {
        $query = Watchface::where('status', 'published')
            ->with(['files.upload', 'categories']);
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function ($watchface) {
                return $this->formatWatchface($watchface);
            });
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
            })
            ->with(['files.upload', 'categories']);
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->get()
            ->map(function ($watchface) {
                return $this->formatWatchface($watchface);
            });
    }

    /**
     * Поиск
     */
    public function search(Request $request)
    {
        $query = Watchface::where('status', 'published')
            ->with(['files.upload', 'categories']);
        
        $searchTerm = $request->input('q');
        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($watchface) {
                return $this->formatWatchface($watchface);
            });
    }

    /**
     * По категории
     */
    public function byCategory(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = $category->watchfaces()
            ->where('status', 'published')
            ->with(['files.upload', 'categories']);
        
        // Фильтрация по совместимости с часами
        $query = $this->filterByCompatibility($query, $request);
        
        return $query->get()
            ->map(function ($watchface) {
                return $this->formatWatchface($watchface);
            });
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

    /**
     * Форматирование данных watchface для API
     */
    private function formatWatchface($watchface)
    {
        // Получаем иконку
        $iconFile = $watchface->files->firstWhere('type', 'icon');
        $iconUrl = $iconFile ? $iconFile->url : null;

        // Получаем баннер
        $bannerFile = $watchface->files->firstWhere('type', 'banner');
        $bannerUrl = $bannerFile ? $bannerFile->url : null;

        return [
            'id' => $watchface->id,
            'title' => $watchface->title,
            'slug' => $watchface->slug,
            'description' => $watchface->description,
            'price' => $watchface->price,
            'discount_price' => $watchface->discount_price,
            'is_free' => $watchface->is_free,
            'type' => $watchface->type,
            'icon' => $iconUrl,
            'banner' => $bannerUrl,
            'categories' => $watchface->categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ];
            }),
        ];
    }
}

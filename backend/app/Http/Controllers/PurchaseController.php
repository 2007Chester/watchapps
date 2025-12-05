<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Watchface;
use App\Models\WatchfaceSale;

class PurchaseController extends Controller
{
    /**
     * Фиксируем покупку циферблата.
     */
    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'watchface_id' => 'required|exists:watchfaces,id',
            'device_sdk'   => 'nullable|integer|min:1|max:100', // SDK часов пользователя
        ]);

        $watchface = Watchface::findOrFail($validated['watchface_id']);

        // Цена и валюта — берем из модели watchface
        $price = $watchface->price;
        $currency = "USD"; // позже добавим многовалютность

        // Запись продажи
        $sale = WatchfaceSale::create([
            'watchface_id' => $watchface->id,
            'user_id'      => $request->user()->id,
            'price'        => $price,
            'currency'     => $currency,
        ]);

        // Получаем подходящий APK файл для часов пользователя
        $apkFile = $this->getCompatibleApkFile($watchface, $validated['device_sdk'] ?? null);

        return response()->json([
            'success' => true,
            'sale_id' => $sale->id,
            'apk_url' => $apkFile ? $apkFile->url : null,
            'apk_version' => $apkFile ? $apkFile->version : null,
        ]);
    }
    
    /**
     * Получить совместимый APK файл для часов пользователя
     */
    private function getCompatibleApkFile(Watchface $watchface, ?int $deviceSdk)
    {
        $apkFiles = \App\Models\WatchfaceFile::where('watchface_id', $watchface->id)
            ->where('type', 'apk')
            ->with('upload')
            ->orderBy('version', 'desc') // Сначала самые новые версии
            ->get();
        
        if ($apkFiles->isEmpty()) {
            return null;
        }
        
        // Если SDK не указан, возвращаем самую новую версию
        if ($deviceSdk === null) {
            return $apkFiles->first();
        }
        
        // Ищем самый подходящий APK файл:
        // 1. min_sdk <= device_sdk
        // 2. max_sdk >= device_sdk (если указан)
        // 3. Самая новая версия среди подходящих
        $compatibleApks = $apkFiles->filter(function ($apk) use ($deviceSdk) {
            $minSdk = $apk->min_sdk;
            $maxSdk = $apk->max_sdk;
            
            // Если min_sdk не указан, считаем совместимым
            if ($minSdk === null) {
                return true;
            }
            
            // Проверяем min_sdk
            if ($minSdk > $deviceSdk) {
                return false;
            }
            
            // Проверяем max_sdk (если указан)
            if ($maxSdk !== null && $maxSdk < $deviceSdk) {
                return false;
            }
            
            return true;
        });
        
        // Возвращаем самую новую версию среди совместимых
        return $compatibleApks->first();
    }
    
    /**
     * Получить APK файл для установки
     * GET /api/watchfaces/{id}/apk?device_sdk=34
     */
    public function getApk(Request $request, $id)
    {
        $watchface = Watchface::findOrFail($id);
        
        // Проверяем, что пользователь купил это приложение
        $hasPurchase = WatchfaceSale::where('watchface_id', $watchface->id)
            ->where('user_id', $request->user()->id)
            ->exists();
        
        // Для бесплатных приложений или если пользователь купил
        if (!$watchface->is_free && !$hasPurchase) {
            return response()->json(['error' => 'You need to purchase this app first'], 403);
        }
        
        $deviceSdk = $request->input('device_sdk');
        if ($deviceSdk !== null) {
            $deviceSdk = (int)$deviceSdk;
        }
        
        $apkFile = $this->getCompatibleApkFile($watchface, $deviceSdk);
        
        if (!$apkFile || !$apkFile->upload) {
            return response()->json(['error' => 'APK file not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'apk_url' => $apkFile->url,
            'version' => $apkFile->version,
            'min_sdk' => $apkFile->min_sdk,
            'target_sdk' => $apkFile->target_sdk,
            'max_sdk' => $apkFile->max_sdk,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Watchface;
use App\Models\WatchfaceFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class WatchfaceService
{
    /**
     * Создание нового watchface
     */
    public function create(array $data, int $developerId): Watchface
    {
        return Watchface::create([
            'developer_id'   => $developerId,
            'title'          => $data['title'],
            'slug'           => Str::slug($data['title']).'-'.uniqid(),
            'description'    => $data['description'] ?? null,
            'price'          => $data['price'],
            'discount_price' => $data['discount_price'] ?? null,
            'discount_start_at' => $data['discount_start_at'] ?? null,
            'discount_end_at'=> $data['discount_end_at'] ?? null,
            'is_free'        => $data['is_free'] ?? false,
            'type'           => $data['type'],
            'status'         => 'draft',
        ]);
    }

    /**
     * Обновление watchface
     */
    public function update(Watchface $watchface, array $data): Watchface
    {
        // Изменили название → обновляем slug
        if (isset($data['title']) && $data['title'] !== $watchface->title) {
            $data['slug'] = Str::slug($data['title']).'-'.uniqid();
        }

        $watchface->update($data);

        return $watchface;
    }

    /**
     * Добавление файлов
     */
    public function attachFiles(Watchface $watchface, array $files): void
    {
        DB::transaction(function () use ($watchface, $files) {
            foreach ($files as $file) {
                $fileData = [
                    'watchface_id' => $watchface->id,
                    'upload_id'    => $file['upload_id'],
                    'type'         => $file['type'],
                    'sort_order'   => $file['sort_order'] ?? 0,
                ];
                
                // Если это APK файл, парсим его и сохраняем данные о версии и SDK
                if ($file['type'] === 'apk') {
                    $apkData = $this->parseAndSaveApkData($watchface, $file['upload_id']);
                    
                    // Сохраняем версию и SDK в watchface_files
                    if ($apkData) {
                        $fileData['version'] = $apkData['version'] ?? null;
                        $fileData['min_sdk'] = $apkData['min_sdk'] ?? null;
                        $fileData['target_sdk'] = $apkData['target_sdk'] ?? null;
                        $fileData['max_sdk'] = $apkData['max_sdk'] ?? null;
                        
                        // Вычисляем и сохраняем wear_os_version на основе min_sdk (минимальная совместимая версия)
                        // API 35+ (Android 15+) → Wear OS 5.1+
                        // API 34 (Android 14) → Wear OS 5.0+
                        // API 30-33 (Android 11-13) → Wear OS 4.0+
                        // API 28-29 (Android 9-10) → Wear OS 3.0+
                        // API 25-27 (Android 7.1-8.1) → Wear OS 2.0+
                        // API 23-24 (Android 6.0-7.0) → Wear OS 1.0+
                        $sdkLevel = $apkData['min_sdk'] ?? null;
                        if ($sdkLevel !== null) {
                            if ($sdkLevel >= 35) {
                                $fileData['wear_os_version'] = 'Wear OS 5.1+';
                            } elseif ($sdkLevel >= 34) {
                                $fileData['wear_os_version'] = 'Wear OS 5.0+';
                            } elseif ($sdkLevel >= 30) {
                                $fileData['wear_os_version'] = 'Wear OS 4.0+';
                            } elseif ($sdkLevel >= 28) {
                                $fileData['wear_os_version'] = 'Wear OS 3.0+';
                            } elseif ($sdkLevel >= 25) {
                                $fileData['wear_os_version'] = 'Wear OS 2.0+';
                            } elseif ($sdkLevel >= 23) {
                                $fileData['wear_os_version'] = 'Wear OS 1.0+';
                            } else {
                                $fileData['wear_os_version'] = 'Not compatible';
                            }
                        }
                    }
                }
                
                // Создаем файл
                $createdFile = WatchfaceFile::create($fileData);
                
                // Если это APK файл, проверяем и удаляем старые APK файлы с тем же SDK
                // Делаем это ПОСЛЕ создания, чтобы знать ID нового файла
                if ($file['type'] === 'apk' && isset($apkData)) {
                    $this->removeOldApkFilesWithSameSdk($watchface, $apkData['min_sdk'] ?? null, $createdFile->id);
                }
            }
        });
    }
    
    /**
     * Удаляет старые APK файлы с тем же SDK, если загружена новая версия
     * Удаляет только если SDK одинаковый, если SDK разный - оставляет оба файла
     * 
     * @param Watchface $watchface
     * @param int|null $newMinSdk Минимальный SDK нового APK файла
     * @param int $newFileId ID только что созданного APK файла
     */
    private function removeOldApkFilesWithSameSdk(Watchface $watchface, ?int $newMinSdk, int $newFileId): void
    {
        if ($newMinSdk === null) {
            return;
        }
        
        // Находим все старые APK файлы с тем же min_sdk (кроме только что созданного)
        $oldApkFiles = WatchfaceFile::where('watchface_id', $watchface->id)
            ->where('type', 'apk')
            ->where('min_sdk', $newMinSdk)
            ->where('id', '<', $newFileId) // Исключаем только что созданный файл
            ->get();
        
        // Удаляем старые файлы
        foreach ($oldApkFiles as $oldFile) {
            // Удаляем upload запись и физический файл
            if ($oldFile->upload) {
                $upload = $oldFile->upload;
                $filePath = \Illuminate\Support\Facades\Storage::disk('public')->path('uploads/' . $upload->filename);
                if (file_exists($filePath)) {
                    @unlink($filePath);
                }
                $upload->delete();
            }
            $oldFile->delete();
        }
    }
    
    /**
     * Парсинг APK и сохранение данных о версии и SDK
     * Возвращает массив с данными APK
     */
    private function parseAndSaveApkData(Watchface $watchface, int $uploadId): ?array
    {
        $upload = \App\Models\Upload::find($uploadId);
        if (!$upload) {
            return null;
        }
        
        $filePath = \Illuminate\Support\Facades\Storage::disk('public')->path('uploads/' . $upload->filename);
        
        if (!file_exists($filePath)) {
            return null;
        }
        
        // Используем Python скрипт для парсинга APK
        $pythonScript = base_path('parse_apk.py');
        if (file_exists($pythonScript)) {
            $output = @shell_exec("python3 \"$pythonScript\" \"$filePath\" 2>&1");
            if ($output) {
                $parsedData = json_decode(trim($output), true);
                if ($parsedData && isset($parsedData['success']) && $parsedData['success']) {
                    $updateData = [];
                    $returnData = [];
                    
                    // Сохраняем package_name только при первой загрузке (если еще не установлен)
                    if (isset($parsedData['package_name']) && !$watchface->package_name) {
                        $updateData['package_name'] = $parsedData['package_name'];
                    }
                    
                    // Проверяем, что package_name совпадает (если уже установлен)
                    if ($watchface->package_name && isset($parsedData['package_name'])) {
                        if ($watchface->package_name !== $parsedData['package_name']) {
                            throw new \Exception('Package name mismatch. This APK belongs to a different application.');
                        }
                    }
                    
                    // Обновляем версию и SDK в watchface (берем самую новую версию)
                    if (isset($parsedData['version'])) {
                        // Обновляем версию только если новая версия выше текущей
                        if (!$watchface->version || version_compare($parsedData['version'], $watchface->version, '>')) {
                            $updateData['version'] = $parsedData['version'];
                        }
                        $returnData['version'] = $parsedData['version'];
                    }
                    
                    if (isset($parsedData['min_sdk'])) {
                        // Обновляем min_sdk только если он меньше текущего (более совместимый)
                        if (!$watchface->min_sdk || $parsedData['min_sdk'] < $watchface->min_sdk) {
                            $updateData['min_sdk'] = $parsedData['min_sdk'];
                        }
                        $returnData['min_sdk'] = $parsedData['min_sdk'];
                    }
                    
                    if (isset($parsedData['target_sdk'])) {
                        // Обновляем target_sdk только если он больше текущего (более новый)
                        if (!$watchface->target_sdk || $parsedData['target_sdk'] > $watchface->target_sdk) {
                            $updateData['target_sdk'] = $parsedData['target_sdk'];
                        }
                        $returnData['target_sdk'] = $parsedData['target_sdk'];
                    }
                    
                    if (isset($parsedData['max_sdk'])) {
                        $returnData['max_sdk'] = $parsedData['max_sdk'];
                    }
                    
                    if (isset($parsedData['wear_os_version'])) {
                        // Обновляем wear_os_version на основе min_sdk (минимальная совместимая версия)
                        // API 35+ (Android 15+) → Wear OS 5.1+
                        // API 34 (Android 14) → Wear OS 5.0+
                        // API 30-33 (Android 11-13) → Wear OS 4.0+
                        // API 28-29 (Android 9-10) → Wear OS 3.0+
                        // API 25-27 (Android 7.1-8.1) → Wear OS 2.0+
                        // API 23-24 (Android 6.0-7.0) → Wear OS 1.0+
                        $sdkLevel = $parsedData['min_sdk'] ?? null;
                        if ($sdkLevel !== null) {
                            if ($sdkLevel >= 35) {
                                $updateData['wear_os_version'] = 'Wear OS 5.1+';
                            } elseif ($sdkLevel >= 34) {
                                $updateData['wear_os_version'] = 'Wear OS 5.0+';
                            } elseif ($sdkLevel >= 30) {
                                $updateData['wear_os_version'] = 'Wear OS 4.0+';
                            } elseif ($sdkLevel >= 28) {
                                $updateData['wear_os_version'] = 'Wear OS 3.0+';
                            } elseif ($sdkLevel >= 25) {
                                $updateData['wear_os_version'] = 'Wear OS 2.0+';
                            } elseif ($sdkLevel >= 23) {
                                $updateData['wear_os_version'] = 'Wear OS 1.0+';
                            } else {
                                $updateData['wear_os_version'] = 'Not compatible';
                            }
                        }
                    }
                    
                    if (!empty($updateData)) {
                        $watchface->update($updateData);
                    }
                    
                    return $returnData;
                }
            }
        }
        
        return null;
    }

    /**
     * Публикация
     */
    public function publish(Watchface $watchface): Watchface
    {
        $watchface->update(['status' => 'published']);
        return $watchface;
    }

    /**
     * Снятие публикации
     */
    public function unpublish(Watchface $watchface): Watchface
    {
        $watchface->update(['status' => 'draft']);
        return $watchface;
    }

    /**
     * Удаление товара
     */
    public function delete(Watchface $watchface): void
    {
        $watchface->delete();
    }
}

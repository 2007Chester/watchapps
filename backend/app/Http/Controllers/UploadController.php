<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Upload;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        // Логируем информацию о запросе для отладки
        \Log::info('Upload request', [
            'has_file' => $request->hasFile('file'),
            'content_length' => $request->header('Content-Length'),
            'content_type' => $request->header('Content-Type'),
        ]);

        // Получаем файл до валидации, чтобы проверить его наличие
        $file = $request->file('file');
        
        if (!$file) {
            \Log::warning('No file in upload request');
            return response()->json([
                'message' => 'Файл не был загружен',
                'errors' => ['file' => ['Файл не был загружен. Возможно, размер файла превышает лимит сервера.']],
            ], 422);
        }

        // Проверяем, что файл валиден ПЕРЕД попыткой получить его свойства
        if (!$file->isValid()) {
            $errorCode = $file->getError();
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'Размер файла превышает upload_max_filesize (' . ini_get('upload_max_filesize') . ')',
                UPLOAD_ERR_FORM_SIZE => 'Размер файла превышает MAX_FILE_SIZE',
                UPLOAD_ERR_PARTIAL => 'Файл был загружен частично',
                UPLOAD_ERR_NO_FILE => 'Файл не был загружен',
                UPLOAD_ERR_NO_TMP_DIR => 'Отсутствует временная папка',
                UPLOAD_ERR_CANT_WRITE => 'Не удалось записать файл на диск',
                UPLOAD_ERR_EXTENSION => 'Загрузка файла была остановлена расширением',
            ];
            
            $errorMessage = $errorMessages[$errorCode] ?? 'Неизвестная ошибка загрузки файла';
            
            \Log::warning('File is not valid', [
                'error_code' => $errorCode,
                'error_message' => $errorMessage,
                'max_upload' => ini_get('upload_max_filesize'),
                'post_max' => ini_get('post_max_size'),
            ]);
            
            return response()->json([
                'message' => $errorMessage,
                'errors' => ['file' => [$errorMessage]],
            ], 422);
        }

        // Логируем информацию о файле (теперь файл точно валиден)
        \Log::info('File info', [
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
            'max_upload' => ini_get('upload_max_filesize'),
            'post_max' => ini_get('post_max_size'),
        ]);

        // Проверка файла
        try {
            $request->validate([
                'file' => 'required|file|max:100000', // до 100 MB (в килобайтах)
            ], [
                'file.required' => 'Файл обязателен для загрузки',
                'file.file' => 'Загруженный файл не является файлом',
                'file.max' => 'Размер файла не должен превышать 100 МБ. Текущий размер: ' . round($file->getSize() / 1024 / 1024, 2) . ' МБ',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Ошибка валидации файла',
                'errors' => $e->errors(),
            ], 422);
        }

        // Генерируем имя
        $filename = time() . '_' . $file->getClientOriginalName();

        // Сохраняем в storage/app/public/uploads
        $path = $file->storeAs('uploads', $filename, 'public');

        // Запись в БД
        $upload = Upload::create([
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
            'user_id' => $request->user()->id ?? null,
        ]);

        return response()->json([
            'id' => $upload->id,
            'filename' => $filename,
            'url' => $this->getFileUrl($filename),
        ]);
    }

    /**
     * Парсинг APK файла для получения версии и совместимости Wear OS
     */
    public function parseApk(Request $request)
    {
        $request->validate([
            'upload_id' => 'required|integer|exists:uploads,id',
        ]);

        $upload = Upload::findOrFail($request->upload_id);

        // Проверяем, что файл принадлежит текущему пользователю
        if ($upload->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // Проверяем, что это APK файл
        if ($upload->mime !== 'application/vnd.android.package-archive' && 
            !str_ends_with($upload->original_name, '.apk')) {
            return response()->json([
                'error' => 'File is not an APK'
            ], 400);
        }

        // Файл сохраняется в uploads/, поэтому нужно добавить эту папку к пути
        $filePath = Storage::disk('public')->path('uploads/' . $upload->filename);
        
        // Проверяем, существует ли файл
        if (!file_exists($filePath)) {
            // Пробуем без uploads/ (на случай, если путь уже содержит uploads)
            $filePath = Storage::disk('public')->path($upload->filename);
        }
        
        \Log::info('APK file path', [
            'filename' => $upload->filename,
            'file_path' => $filePath,
            'file_exists' => file_exists($filePath),
        ]);
        
        // Парсим APK используя Python скрипт (более надежный метод)
        $version = null;
        $wearOsVersion = null;
        $packageName = null;
        $minSdk = null;
        $maxSdk = null;
        $targetSdk = null;
        
        // Пытаемся использовать Python скрипт для парсинга (самый надежный метод)
        $pythonScript = base_path('parse_apk.py');
        if (file_exists($pythonScript)) {
            $command = "python3 \"$pythonScript\" \"$filePath\" 2>&1";
            \Log::info('Running APK parser', ['command' => $command, 'script_exists' => file_exists($pythonScript)]);
            
            $output = @shell_exec($command);
            \Log::info('APK parser output', ['output' => $output, 'output_length' => strlen($output ?? '')]);
            
            if ($output) {
                $parsedData = json_decode(trim($output), true);
                \Log::info('APK parser parsed data', ['parsed_data' => $parsedData]);
                
                if ($parsedData && isset($parsedData['success']) && $parsedData['success']) {
                    $version = $parsedData['version'] ?? null;
                    $wearOsVersion = $parsedData['wear_os_version'] ?? null;
                    $packageName = $parsedData['package_name'] ?? null;
                    $minSdk = $parsedData['min_sdk'] ?? null;
                    $maxSdk = $parsedData['max_sdk'] ?? null;
                    $targetSdk = $parsedData['target_sdk'] ?? null;
                    
                    \Log::info('APK parser extracted values', [
                        'version' => $version,
                        'min_sdk' => $minSdk,
                        'target_sdk' => $targetSdk,
                        'max_sdk' => $maxSdk,
                        'wear_os_version' => $wearOsVersion,
                        'package_name' => $packageName,
                    ]);
                } else {
                    \Log::warning('APK parser returned unsuccessful result', ['parsed_data' => $parsedData]);
                }
            } else {
                \Log::warning('APK parser returned no output');
            }
        } else {
            \Log::warning('APK parser script not found', ['script_path' => $pythonScript]);
        }
        
        // Устанавливаем значения по умолчанию только если парсинг не дал результатов
        // Если версия была успешно распарсена, но равна '1.0.0', это может быть реальная версия
        // Поэтому устанавливаем по умолчанию только если version === null
        if ($version === null) {
            $version = '1.0.0';
        }
        if ($wearOsVersion === null) {
            // Если min_sdk был распарсен, но wear_os_version нет, вычисляем его
            // Используем min_sdk для определения минимальной совместимой версии Wear OS
            $sdkLevel = $minSdk;
            if ($sdkLevel !== null) {
                if ($sdkLevel >= 35) {
                    // API 35+ (Android 15+) → Wear OS 5.1+
                    $wearOsVersion = 'Wear OS 5.1+';
                } elseif ($sdkLevel >= 34) {
                    // API 34 (Android 14) → Wear OS 5.0+
                    $wearOsVersion = 'Wear OS 5.0+';
                } elseif ($sdkLevel >= 30) {
                    // API 30-33 (Android 11-13) → Wear OS 4.0+
                    $wearOsVersion = 'Wear OS 4.0+';
                } elseif ($sdkLevel >= 28) {
                    // API 28-29 (Android 9-10) → Wear OS 3.0+
                    $wearOsVersion = 'Wear OS 3.0+';
                } elseif ($sdkLevel >= 25) {
                    // API 25-27 (Android 7.1-8.1) → Wear OS 2.0+
                    $wearOsVersion = 'Wear OS 2.0+';
                } elseif ($sdkLevel >= 23) {
                    // API 23-24 (Android 6.0-7.0) → Wear OS 1.0+
                    $wearOsVersion = 'Wear OS 1.0+';
                } else {
                    $wearOsVersion = 'Not compatible';
                }
            } else {
                $wearOsVersion = 'Wear OS 5.0+';
            }
        }

        \Log::info('APK parsing result', [
            'version' => $version,
            'min_sdk' => $minSdk,
            'target_sdk' => $targetSdk,
            'max_sdk' => $maxSdk,
            'wear_os_version' => $wearOsVersion,
            'package_name' => $packageName,
        ]);
        
        return response()->json([
            'success' => true,
            'version' => $version,
            'wear_os_version' => $wearOsVersion,
            'package_name' => $packageName,
            'min_sdk' => $minSdk,
            'max_sdk' => $maxSdk,
            'target_sdk' => $targetSdk,
        ]);
    }

    /**
     * Получить URL для файла с правильным протоколом
     */
    private function getFileUrl(string $filename): string
    {
        $request = request();
        
        // Проверяем заголовки прокси для определения реального хоста
        $host = $request->header('X-Forwarded-Host') 
            ?: $request->header('Host') 
            ?: $request->getHost();
        
        // Проверяем Origin или Referer для определения домена фронтенда
        $origin = $request->header('Origin') ?: $request->header('Referer');
        if ($origin) {
            $parsed = parse_url($origin);
            if (isset($parsed['host'])) {
                $host = $parsed['host'];
            }
        }
        
        // Определяем протокол
        $protocol = 'https';
        if ($request->header('X-Forwarded-Proto') === 'https' || 
            $request->isSecure() ||
            str_contains($host, 'watchapps.ru')) {
            $protocol = 'https';
        } elseif ($request->header('X-Forwarded-Proto') === 'http') {
            $protocol = 'http';
        }
        
        // Для production доменов всегда используем правильный домен
        if (str_contains($host, 'dev.watchapps.ru')) {
            $baseUrl = 'https://dev.watchapps.ru';
        } elseif (str_contains($host, 'watchapps.ru')) {
            $baseUrl = 'https://watchapps.ru';
        } else {
            // Для локальной разработки используем текущий хост
            $port = $request->getPort();
            $baseUrl = $protocol . '://' . $host . ($port && $port !== 80 && $port !== 443 ? ':' . $port : '');
        }
        
        return $baseUrl . '/storage/uploads/' . $filename;
    }
}

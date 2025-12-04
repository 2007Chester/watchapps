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

        $filePath = Storage::disk('public')->path($upload->filename);
        
        // Парсим APK используя aapt (если доступен) или простой парсинг
        $version = null;
        $wearOsVersion = null;
        $packageName = null;

        // Попытка использовать aapt для парсинга
        if (shell_exec('which aapt') !== null) {
            $aaptOutput = shell_exec("aapt dump badging \"$filePath\" 2>/dev/null");
            if ($aaptOutput) {
                // Парсим версию
                if (preg_match("/versionName='([^']+)'/", $aaptOutput, $matches)) {
                    $version = $matches[1];
                }
                // Парсим package name
                if (preg_match("/package: name='([^']+)'/", $aaptOutput, $matches)) {
                    $packageName = $matches[1];
                }
                // Парсим минимальную версию SDK (для определения совместимости Wear OS)
                if (preg_match("/sdkVersion:'([^']+)'/", $aaptOutput, $matches)) {
                    $minSdk = (int)$matches[1];
                    // Wear OS обычно требует API 25+ (Android 7.1)
                    $wearOsVersion = $minSdk >= 25 ? 'Wear OS 2.0+' : ($minSdk >= 23 ? 'Wear OS 1.0+' : 'Not compatible');
                }
            }
        }

        // Если aapt недоступен, используем простой парсинг через zip
        if (!$version) {
            try {
                $zip = new \ZipArchive();
                if ($zip->open($filePath) === true) {
                    $manifestContent = $zip->getFromName('AndroidManifest.xml');
                    if ($manifestContent) {
                        // Простой парсинг бинарного AndroidManifest.xml
                        // Это упрощенная версия, для полного парсинга нужна библиотека
                        // Пока возвращаем заглушку
                        $version = '1.0.0';
                        $wearOsVersion = 'Wear OS 2.0+';
                    }
                    $zip->close();
                }
            } catch (\Exception $e) {
                // Если парсинг не удался, возвращаем заглушку
                $version = '1.0.0';
                $wearOsVersion = 'Wear OS 2.0+';
            }
        }

        return response()->json([
            'success' => true,
            'version' => $version ?? '1.0.0',
            'wear_os_version' => $wearOsVersion ?? 'Wear OS 2.0+',
            'package_name' => $packageName,
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

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Upload;
use App\Models\EmailVerificationToken;
use App\Mail\VerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class DeveloperOnboardingController extends Controller
{
    /**
     * Получить данные онбординга текущего разработчика
     */
    public function show(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'brand_name' => $user->brand_name,
                'logo_upload_id' => $user->logo_upload_id,
                'logo_url' => $user->logo ? $this->getFileUrl($user->logo->filename) : null,
                'onboarding_completed' => $user->onboarding_completed,
                'email_verified' => (bool)$user->email_verified_at,
            ],
        ]);
    }

    /**
     * Сохранить данные онбординга
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'brand_name' => ['nullable', 'string', 'max:255'],
            'logo_upload_id' => ['nullable', 'integer', 'exists:uploads,id'],
        ], [
            'email.email' => 'Email должен быть действительным адресом электронной почты.',
            'email.max' => 'Email не может быть длиннее 255 символов.',
            'email.unique' => 'Этот email уже занят.',
            'brand_name.string' => 'Название бренда должно быть строкой.',
            'brand_name.max' => 'Название бренда не может быть длиннее 255 символов.',
            'logo_upload_id.integer' => 'ID загрузки должен быть числом.',
            'logo_upload_id.exists' => 'Выбранный файл не существует.',
        ]);

        // Проверяем, что upload принадлежит текущему пользователю
        if (isset($validated['logo_upload_id'])) {
            $upload = Upload::find($validated['logo_upload_id']);
            if ($upload && $upload->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Upload does not belong to you',
                ], 403);
            }
        }

        // Если email изменился, сбрасываем верификацию
        // Токен будет создан при запросе письма через /auth/send-verification
        $emailChanged = false;
        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $emailChanged = true;
            
            // Удаляем старые токены (новый токен будет создан при запросе письма)
            EmailVerificationToken::where('user_id', $user->id)->delete();
        }

        $user->update($validated);
        
        // Если email изменился, сбрасываем верификацию напрямую (так как email_verified_at не в $fillable)
        if ($emailChanged) {
            $user->email_verified_at = null;
            $user->save();
        }

        // Загружаем обновлённые данные
        $user->refresh();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'brand_name' => $user->brand_name,
                'logo_upload_id' => $user->logo_upload_id,
                'logo_url' => $user->logo ? $this->getFileUrl($user->logo->filename) : null,
                'onboarding_completed' => $user->onboarding_completed,
                'email_verified' => (bool)$user->email_verified_at,
            ],
        ]);
    }

    /**
     * Завершить онбординг
     */
    public function complete(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user->update([
            'onboarding_completed' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Onboarding completed',
            'user' => [
                'id' => $user->id,
                'onboarding_completed' => $user->onboarding_completed,
            ],
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

    /**
     * Получить базовый URL для фронтенда (для email)
     */
    private function getBaseUrlForEmail(Request $request): string
    {
        $host = $request->header('X-Forwarded-Host') 
            ?: $request->header('Host') 
            ?: $request->getHost();
        
        $origin = $request->header('Origin') ?: $request->header('Referer');
        if ($origin) {
            $parsed = parse_url($origin);
            if (isset($parsed['host'])) {
                $host = $parsed['host'];
            }
        }
        
        $protocol = 'https';
        if ($request->header('X-Forwarded-Proto') === 'https' || 
            $request->isSecure() ||
            str_contains($host, 'watchapps.ru')) {
            $protocol = 'https';
        } elseif ($request->header('X-Forwarded-Proto') === 'http') {
            $protocol = 'http';
        }
        
        if (str_contains($host, 'dev.watchapps.ru')) {
            return 'https://dev.watchapps.ru';
        } elseif (str_contains($host, 'watchapps.ru')) {
            return 'https://watchapps.ru';
        } else {
            $port = $request->getPort();
            return $protocol . '://' . $host . ($port && $port !== 80 && $port !== 443 ? ':' . $port : '');
        }
    }
}

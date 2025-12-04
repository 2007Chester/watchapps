<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

use App\Models\EmailVerificationToken;
use App\Mail\VerifyEmail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    /**
     * Регистрация: создаём пользователя или добавляем новую роль.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'string', 'email', 'max:255'],
            'password'              => ['required', 'string', 'min:6'],
            'password_confirmation' => ['required', 'same:password'],
            'role'                  => ['required', Rule::in(['user', 'developer', 'admin'])],
        ]);

        $role = $validated['role'];

        // Ищем пользователя по email
        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            // Создаём нового пользователя
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
        } else {
            // Обновляем имя
            if ($user->name !== $validated['name']) {
                $user->update(['name' => $validated['name']]);
            }
        }

        // Проверяем, есть ли уже эта роль
        $roleExists = UserRole::where('user_id', $user->id)
            ->where('role', $role)
            ->exists();

        if ($roleExists) {
            return response()->json([
                'message' => 'Эта роль уже привязана к аккаунту.',
            ], 422);
        }

        // ДОБАВЛЯЕМ НОВУЮ РОЛЬ
        $newRole = UserRole::create([
            'user_id' => $user->id,
            'role'    => $role,
        ]);

        if (!$newRole) {
            return response()->json([
                'message' => 'Ошибка при сохранении роли.',
            ], 500);
        }

        // Создаём токен
        $token = $user->createToken('auth_token')->plainTextToken;

        // Отправляем письмо для подтверждения email, если email не подтверждён
        if (!$user->email_verified_at) {
            try {
                // Удаляем старые токены
                EmailVerificationToken::where('user_id', $user->id)->delete();

                // Генерируем новый токен
                $verificationToken = Str::random(64);

                EmailVerificationToken::create([
                    'user_id' => $user->id,
                    'token' => $verificationToken,
                    'created_at' => now(),
                ]);

                // Определяем URL для подтверждения
                $baseUrl = $this->getBaseUrl($request);
                $verificationUrl = "{$baseUrl}/verify-email?token={$verificationToken}";

                // Отправляем письмо
                Mail::to($user->email)->send(new VerifyEmail($user, $verificationUrl));
            } catch (\Exception $e) {
                \Log::error('Failed to send verification email on registration: ' . $e->getMessage());
                // Не прерываем регистрацию, если не удалось отправить письмо
            }
        }

        return response()->json([
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'roles'        => $user->getRoleNames(),
                'primary_role' => $user->primary_role,
                'verified'     => (bool)$user->email_verified_at,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Логин
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Неверный email или пароль.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'roles'        => $user->getRoleNames(),
                'primary_role' => $user->primary_role,
                'verified'     => (bool)$user->email_verified_at,
                'email_verified' => (bool)$user->email_verified_at,
                'onboarding_completed' => $user->onboarding_completed,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Текущий пользователь
     */
    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Получаем URL логотипа, если он есть
        $logoUrl = null;
        if ($user->logo) {
            $logoUrl = $this->getFileUrl($user->logo->filename);
        }

        // Проверяем, есть ли платежные данные
        $hasPaymentDetails = !empty($user->payment_details) && is_array($user->payment_details) && count($user->payment_details) > 0;

        return response()->json([
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'roles'        => $user->getRoleNames(),
            'primary_role' => $user->primary_role,
            'brand_name'   => $user->brand_name,
            'logo_upload_id' => $user->logo_upload_id,
            'logo_url'     => $logoUrl,
            'onboarding_completed' => $user->onboarding_completed,
            'verified'     => (bool)$user->email_verified_at,
            'email_verified' => (bool)$user->email_verified_at,
            'developer_verified_by_admin' => (bool)$user->developer_verified_by_admin,
            'has_payment_details' => $hasPaymentDetails,
            'can_publish_paid_apps' => (bool)$user->developer_verified_by_admin && $hasPaymentDetails,
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
     * Logout
     */
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Проверка email
     */
    public function checkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => ['required', Rule::in(['user', 'developer', 'admin'])],
        ]);

        $email = $request->email;
        $role = $request->role;

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'exists' => false,
                'exists_other' => false,
            ]);
        }

        $hasSameRole = UserRole::where('user_id', $user->id)
            ->where('role', $role)
            ->exists();

        if ($hasSameRole) {
            return response()->json([
                'exists' => true,
                'exists_other' => false,
            ]);
        }

        return response()->json([
            'exists' => false,
            'exists_other' => true,
        ]);
    }

    public function sendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email уже подтверждён'], 422);
        }

        // Удаляем старые токены
        EmailVerificationToken::where('user_id', $user->id)->delete();

        // Генерируем новый токен
        $token = Str::random(64);

        EmailVerificationToken::create([
            'user_id' => $user->id,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Определяем URL для подтверждения
        $baseUrl = $this->getBaseUrl($request);
        $verificationUrl = "{$baseUrl}/verify-email?token={$token}";

        // Отправляем письмо
        try {
            Mail::to($user->email)->send(new VerifyEmail($user, $verificationUrl));
            
            return response()->json([
                'message' => 'Письмо с подтверждением отправлено на ваш email',
                'success' => true
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
            
            // Определяем тип ошибки для более понятного сообщения
            $errorMessage = $e->getMessage();
            $userMessage = 'Не удалось отправить письмо. Попробуйте позже.';
            
            // Проверяем на ошибку аутентификации mail.ru
            if (str_contains($errorMessage, 'parol prilozheniya') || 
                str_contains($errorMessage, 'Application password is REQUIRED')) {
                $userMessage = 'Ошибка: Mail.ru требует пароль приложения. Обратитесь к администратору.';
            } elseif (str_contains($errorMessage, 'Authentication failed') || 
                      str_contains($errorMessage, '535')) {
                $userMessage = 'Ошибка аутентификации SMTP. Проверьте настройки почты.';
            } elseif (str_contains($errorMessage, 'Connection') || 
                      str_contains($errorMessage, 'timeout')) {
                $userMessage = 'Не удалось подключиться к SMTP серверу. Проверьте настройки.';
            }
            
            return response()->json([
                'message' => $userMessage,
                'error' => config('app.debug') ? $errorMessage : null
            ], 500);
        }
    }

    /**
     * Получить базовый URL для фронтенда
     */
    private function getBaseUrl(Request $request): string
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

    public function verifyEmail(Request $request, $token)
    {
        $record = EmailVerificationToken::where('token', $token)->first();

        if (!$record) {
            // Редирект на фронтенд с ошибкой
            $baseUrl = $this->getBaseUrl($request);
            return redirect("{$baseUrl}/verify-email?error=invalid_token");
        }

        // Проверяем, не истек ли токен (24 часа)
        if ($record->created_at) {
            // Преобразуем в Carbon, если это строка
            $createdAt = is_string($record->created_at) 
                ? \Carbon\Carbon::parse($record->created_at) 
                : $record->created_at;
            
            $expiresAt = $createdAt->copy()->addHours(24);
            if ($expiresAt->isPast()) {
                $record->delete();
                $baseUrl = $this->getBaseUrl($request);
                return redirect("{$baseUrl}/verify-email?error=expired_token");
            }
        }

        $user = $record->user;

        // Если email уже подтверждён
        if ($user->email_verified_at) {
            $record->delete();
            $baseUrl = $this->getBaseUrl($request);
            return redirect("{$baseUrl}/verify-email?success=already_verified");
        }

        // Подтверждаем email
        $user->email_verified_at = now();
        $user->save();

        $record->delete();

        // Редирект на фронтенд с успехом
        $baseUrl = $this->getBaseUrl($request);
        $isDev = str_contains($baseUrl, 'dev.watchapps.ru');
        $redirectUrl = $isDev ? "{$baseUrl}/dev/dashboard" : "{$baseUrl}/";
        
        return redirect("{$baseUrl}/verify-email?success=true&redirect=" . urlencode($redirectUrl));
    }

    /**
     * Запрос на восстановление пароля
     */
    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            // Для безопасности не сообщаем, что пользователь не найден
            return response()->json([
                'message' => 'Если email существует, на него будет отправлена ссылка для восстановления пароля.',
            ]);
        }

        // Генерируем токен восстановления
        $token = Str::random(64);
        
        // Сохраняем токен в таблицу password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Определяем базовый URL для ссылки восстановления
        $baseUrl = $this->getBaseUrl($request);
        
        // Определяем, какой домен используется (dev или main)
        $isDev = str_contains($baseUrl, 'dev.watchapps.ru');
        $resetPath = $isDev ? '/dev/reset-password' : '/reset-password';
        
        // Формируем ссылку для восстановления
        $resetLink = "{$baseUrl}{$resetPath}?token={$token}&email=" . urlencode($user->email);

        // Отправляем email
        Mail::raw("Для восстановления пароля перейдите по ссылке:\n\n{$resetLink}\n\nСсылка действительна в течение 60 минут.", function($msg) use ($user) {
            $msg->to($user->email)
                ->subject("Восстановление пароля — WatchApps");
        });

        return response()->json([
            'message' => 'Если email существует, на него будет отправлена ссылка для восстановления пароля.',
        ]);
    }

    /**
     * Сброс пароля по токену
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6'],
            'password_confirmation' => ['required', 'same:password'],
        ]);

        // Ищем запись о восстановлении пароля
        $record = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Неверный или истекший токен восстановления.',
            ], 400);
        }

        // Проверяем, не истек ли токен (60 минут)
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            return response()->json([
                'message' => 'Токен восстановления истек. Запросите новую ссылку.',
            ], 400);
        }

        // Проверяем токен
        if (!Hash::check($validated['token'], $record->token)) {
            return response()->json([
                'message' => 'Неверный токен восстановления.',
            ], 400);
        }

        // Обновляем пароль
        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            return response()->json([
                'message' => 'Пользователь не найден.',
            ], 404);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        // Удаляем использованный токен
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'Пароль успешно изменен.',
        ]);
    }

}

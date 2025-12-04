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
use Illuminate\Support\Facades\Hash;
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

    /**
     * Получить платежную информацию
     */
    public function getPaymentInfo(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json([
            'success' => true,
            'payment_details' => $user->payment_details ?? null,
            'contract_upload_id' => $user->contract_upload_id,
            'contract_url' => $user->contract ? $this->getFileUrl($user->contract->filename) : null,
            'payment_sent_for_approval' => $user->payment_sent_for_approval,
            'payment_approved_by_admin' => $user->payment_approved_by_admin,
        ]);
    }

    /**
     * Сохранить платежную информацию
     */
    public function updatePaymentInfo(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'card_number' => ['required', 'string', 'regex:/^[0-9\s]{13,19}$/'],
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[\+]?[0-9\s\-\(\)]{10,20}$/'],
            'registration_address' => ['required', 'string', 'max:500'],
            'employment_type' => ['required', 'string', Rule::in(['ИП', 'самозанятый'])],
            'data_verified' => ['nullable', 'boolean'],
            'contract_upload_id' => ['nullable', 'integer', 'exists:uploads,id'],
        ], [
            'card_number.required' => 'Номер карты обязателен для заполнения.',
            'card_number.regex' => 'Номер карты должен содержать от 13 до 19 цифр.',
            'full_name.required' => 'ФИО обязательно для заполнения.',
            'full_name.max' => 'ФИО не может быть длиннее 255 символов.',
            'phone.required' => 'Номер телефона обязателен для заполнения.',
            'phone.regex' => 'Номер телефона должен быть в правильном формате.',
            'registration_address.required' => 'Адрес регистрации обязателен для заполнения.',
            'registration_address.max' => 'Адрес регистрации не может быть длиннее 500 символов.',
            'employment_type.required' => 'Тип занятости обязателен для заполнения.',
            'employment_type.in' => 'Тип занятости должен быть "ИП" или "самозанятый".',
        ]);

        // Убираем пробелы из номера карты для хранения
        $validated['card_number'] = preg_replace('/\s+/', '', $validated['card_number']);

        // Сохраняем data_verified в payment_details
        $paymentDetails = [
            'card_number' => $validated['card_number'],
            'full_name' => $validated['full_name'],
            'phone' => $validated['phone'],
            'registration_address' => $validated['registration_address'],
            'employment_type' => $validated['employment_type'],
            'data_verified' => $validated['data_verified'] ?? false,
        ];

        // Сохраняем платежную информацию
        $user->payment_details = $paymentDetails;
        
        // Сохраняем contract_upload_id, если указан
        if (isset($validated['contract_upload_id'])) {
            $upload = Upload::find($validated['contract_upload_id']);
            if ($upload && $upload->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Upload does not belong to you',
                ], 403);
            }
            $user->contract_upload_id = $validated['contract_upload_id'];
        }
        
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Платежная информация сохранена',
            'payment_details' => $user->payment_details,
            'contract_upload_id' => $user->contract_upload_id,
            'contract_url' => $user->contract ? $this->getFileUrl($user->contract->filename) : null,
        ]);
    }

    /**
     * Отправить платежную информацию на подтверждение администратору
     */
    public function sendPaymentForApproval(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Проверяем, что все данные заполнены
        if (!$user->payment_details || 
            !isset($user->payment_details['card_number']) ||
            !isset($user->payment_details['full_name']) ||
            !isset($user->payment_details['phone']) ||
            !isset($user->payment_details['registration_address']) ||
            !isset($user->payment_details['employment_type'])) {
            return response()->json([
                'message' => 'Необходимо заполнить всю платежную информацию',
            ], 422);
        }

        // Проверяем, что пользователь подтвердил данные
        if (!isset($user->payment_details['data_verified']) || !$user->payment_details['data_verified']) {
            return response()->json([
                'message' => 'Необходимо подтвердить корректность введенных данных',
            ], 422);
        }

        // Проверяем, что договор загружен
        if (!$user->contract_upload_id) {
            return response()->json([
                'message' => 'Необходимо загрузить подписанный договор',
            ], 422);
        }

        // Отправляем на подтверждение
        $user->payment_sent_for_approval = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Платежная информация отправлена на подтверждение администратору',
        ]);
    }

    /**
     * Смена пароля
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        if (!in_array('developer', $user->getRoleNames())) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:6'],
            'new_password_confirmation' => ['required', 'string', 'same:new_password'],
        ], [
            'current_password.required' => 'Текущий пароль обязателен для заполнения.',
            'new_password.required' => 'Новый пароль обязателен для заполнения.',
            'new_password.min' => 'Новый пароль должен содержать минимум 6 символов.',
            'new_password_confirmation.required' => 'Подтверждение пароля обязательно для заполнения.',
            'new_password_confirmation.same' => 'Подтверждение пароля не совпадает с новым паролем.',
        ]);

        // Проверяем текущий пароль
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Неверный текущий пароль.',
                'errors' => [
                    'current_password' => ['Неверный текущий пароль.'],
                ],
            ], 422);
        }

        // Проверяем, что новый пароль отличается от текущего
        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'message' => 'Новый пароль должен отличаться от текущего.',
                'errors' => [
                    'new_password' => ['Новый пароль должен отличаться от текущего.'],
                ],
            ], 422);
        }

        // Обновляем пароль
        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Пароль успешно изменен',
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Watchface;
use App\Models\Category;
use App\Models\Upload;
use App\Services\WatchfaceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WatchfaceController extends Controller
{
    protected WatchfaceService $service;

    /**
     * Внедрение сервиса через конструктор
     */
    public function __construct(WatchfaceService $service)
    {
        $this->service = $service;
    }

    /**
     * Список watchfaces текущего разработчика (Dev Console)
     */
    public function index(Request $request)
    {
        $developerId = $request->user()->id;

        $items = Watchface::where('developer_id', $developerId)
            ->with(['files.upload', 'categories'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'items'   => $items
        ]);
    }

    /**
     * Создание нового Watchface (Dev Console)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'required|integer|min:0',
            'is_free'         => 'boolean',
            'type'            => 'required|in:watchface,app',

            // скидка
            'discount_percent' => 'nullable|integer|min:1|max:99',
            'discount_start_at' => 'nullable|date',
            'discount_end_at' => 'nullable|date',

            // категории
            'categories'      => 'nullable|array',
            'categories.*'    => 'integer|exists:categories,id',
        ]);

        // Валидация скидки (для нового watchface)
        if (isset($data['discount_percent']) || isset($data['discount_start_at']) || isset($data['discount_end_at'])) {
            $this->validateDiscount(null, $data, $data['price'] ?? 0);
        }
        
        // Вычисляем discount_price из discount_percent
        if (isset($data['discount_percent']) && isset($data['price'])) {
            $discountPercent = (int)$data['discount_percent'];
            $regularPrice = (int)$data['price'];
            $data['discount_price'] = (int)round($regularPrice * (1 - $discountPercent / 100));
        }

        // Проверка прав на публикацию платных приложений
        $isFree = $data['is_free'] ?? ($data['price'] == 0);
        
        if (!$isFree) {
            // Проверяем, подтвержден ли разработчик администратором
            if (!$user->developer_verified_by_admin) {
                return response()->json([
                    'error' => 'Для публикации платных приложений необходимо подтверждение администратором',
                    'message' => 'Ваш аккаунт должен быть подтвержден администратором для публикации платных приложений.'
                ], 403);
            }

            // Проверяем наличие платежных данных
            $hasPaymentDetails = !empty($user->payment_details) && is_array($user->payment_details) && count($user->payment_details) > 0;
            if (!$hasPaymentDetails) {
                return response()->json([
                    'error' => 'Необходимо указать платежные данные',
                    'message' => 'Для публикации платных приложений необходимо указать платежные данные в профиле.'
                ], 403);
            }
        }

        $watchface = $this->service->create($data, $user->id);

        if (!empty($data['categories'])) {
            $watchface->categories()->sync($data['categories']);
        }

        return response()->json([
            'success'   => true,
            'watchface' => $watchface->load('categories', 'files')
        ]);
    }

    /**
     * Получить один watchface для страницы редактирования (Dev Console)
     */
    public function show(Request $request, $id)
    {
        $watchface = Watchface::with(['files', 'categories'])
            ->findOrFail($id);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json([
            'success'   => true,
            'watchface' => $watchface
        ]);
    }

    /**
     * Привязать файлы (apk, icon, banner, screenshot, preview_video)
     */
    public function attachFiles(Request $request, $id)
    {
        $data = $request->validate([
            'files'               => 'required|array',
            'files.*.upload_id'   => 'required|integer|exists:uploads,id',
            'files.*.type'        => 'required|in:icon,banner,screenshot,apk,preview_video',
            'files.*.sort_order'  => 'nullable|integer|min:0',
        ]);

        $watchface = Watchface::findOrFail($id);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $this->service->attachFiles($watchface, $data['files']);

        return response()->json([
            'success'   => true,
            'watchface' => $watchface->load('files')
        ]);
    }

    /**
     * Обновление watchface + категорий + цены и скидки
     */
    public function update(Request $request, $id)
    {
        $watchface = Watchface::findOrFail($id);
        $user = $request->user();

        if ($watchface->developer_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'price'           => 'sometimes|integer|min:0',
            'is_free'         => 'sometimes|boolean',
            'type'            => 'sometimes|in:watchface,app',

            // скидка
            'discount_percent' => 'nullable|integer|min:1|max:99',
            'discount_start_at' => 'nullable|date',
            'discount_end_at' => 'nullable|date',

            // категории
            'categories'      => 'nullable|array',
            'categories.*'    => 'integer|exists:categories,id',
        ]);

        // Валидация скидки
        if (isset($data['discount_percent']) || isset($data['discount_start_at']) || isset($data['discount_end_at'])) {
            $this->validateDiscount($watchface, $data, $data['price'] ?? $watchface->price);
        }
        
        // Вычисляем discount_price из discount_percent
        if (isset($data['discount_percent'])) {
            $discountPercent = (int)$data['discount_percent'];
            $regularPrice = (int)($data['price'] ?? $watchface->price);
            $data['discount_price'] = (int)round($regularPrice * (1 - $discountPercent / 100));
        }

        // Проверка прав на публикацию платных приложений (если цена меняется)
        if (array_key_exists('price', $data) || array_key_exists('is_free', $data)) {
            $isFree = $data['is_free'] ?? ($data['price'] == 0 ?? $watchface->is_free);
            
            if (!$isFree) {
                // Проверяем, подтвержден ли разработчик администратором
                if (!$user->developer_verified_by_admin) {
                    return response()->json([
                        'error' => 'Для публикации платных приложений необходимо подтверждение администратором',
                        'message' => 'Ваш аккаунт должен быть подтвержден администратором для публикации платных приложений.'
                    ], 403);
                }

                // Проверяем наличие платежных данных
                $hasPaymentDetails = !empty($user->payment_details) && is_array($user->payment_details) && count($user->payment_details) > 0;
                if (!$hasPaymentDetails) {
                    return response()->json([
                        'error' => 'Необходимо указать платежные данные',
                        'message' => 'Для публикации платных приложений необходимо указать платежные данные в профиле.'
                    ], 403);
                }
            }
        }

        $updated = $this->service->update($watchface, $data);

        if (array_key_exists('categories', $data)) {
            $watchface->categories()->sync($data['categories'] ?? []);
        }

        return response()->json([
            'success'   => true,
            'watchface' => $updated->load('categories', 'files')
        ]);
    }

    /**
     * Удаление watchface (с отвязкой категорий и файлов)
     */
    public function destroy(Request $request, $id)
    {
        $watchface = Watchface::with('files')->findOrFail($id);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // удаляем связанные файлы и uploads
        foreach ($watchface->files as $file) {
            $upload = Upload::find($file->upload_id);
            if ($upload && $upload->path) {
                Storage::delete($upload->path);
                $upload->delete();
            }
            $file->delete();
        }

        $watchface->categories()->detach();
        $this->service->delete($watchface);

        return response()->json(['success' => true]);
    }

    /**
     * Публикация watchface
     */
    public function publish(Request $request, $id)
    {
        $watchface = Watchface::findOrFail($id);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $updated = $this->service->publish($watchface);

        return response()->json([
            'success'   => true,
            'watchface' => $updated->load('categories', 'files')
        ]);
    }

    /**
     * Снятие watchface с публикации
     */
    public function unpublish(Request $request, $id)
    {
        $watchface = Watchface::findOrFail($id);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $updated = $this->service->unpublish($watchface);

        return response()->json([
            'success'   => true,
            'watchface' => $updated->load('categories', 'files')
        ]);
    }

    /**
     * Удалить файл (icon/banner/screenshot/apk/preview_video) у watchface
     * c удалением upload-записи и физического файла
     */
    public function deleteFile(Request $request, $watchfaceId, $fileId)
    {
        $watchface = Watchface::with('files')->findOrFail($watchfaceId);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $file = $watchface->files()->where('id', $fileId)->first();

        if (!$file) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $upload = Upload::find($file->upload_id);
        if ($upload && $upload->path) {
            Storage::delete($upload->path);
            $upload->delete();
        }

        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'File removed successfully'
        ]);
    }

    /**
     * Заменить файл (icon/banner/screenshot/apk/preview_video) новым upload_id
     * с удалением старого файла
     */
    public function replaceFile(Request $request, $watchfaceId, $fileId)
    {
        $data = $request->validate([
            'upload_id' => 'required|integer|exists:uploads,id',
            'type'      => 'nullable|in:icon,banner,screenshot,apk,preview_video',
        ]);

        $watchface = Watchface::with('files')->findOrFail($watchfaceId);

        if ($watchface->developer_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $file = $watchface->files()->where('id', $fileId)->first();

        if (!$file) {
            return response()->json(['error' => 'File not found'], 404);
        }

        // удаляем старый upload-файл
        $oldUpload = Upload::find($file->upload_id);
        if ($oldUpload && $oldUpload->path) {
            Storage::delete($oldUpload->path);
            $oldUpload->delete();
        }

        // привязываем новый upload
        $file->upload_id = $data['upload_id'];

        if (!empty($data['type'])) {
            $file->type = $data['type'];
        }

        $file->save();

        return response()->json([
            'success' => true,
            'file'    => $file
        ]);
    }

    /**
     * Валидация скидки
     */
    private function validateDiscount(?Watchface $watchface, array $data, int $regularPrice)
    {
        // Если скидка не указана, пропускаем валидацию
        if (!isset($data['discount_percent']) && !isset($data['discount_start_at']) && !isset($data['discount_end_at'])) {
            return;
        }

        // Все поля обязательны для скидки
        if (!isset($data['discount_percent']) || !isset($data['discount_start_at']) || !isset($data['discount_end_at'])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'discount' => ['Для установки скидки необходимо указать процент скидки, дату начала и дату окончания.'],
            ]);
        }

        $discountPercent = (int)$data['discount_percent'];
        $discountStartAt = \Carbon\Carbon::parse($data['discount_start_at']);
        $discountEndAt = \Carbon\Carbon::parse($data['discount_end_at']);
        $now = \Carbon\Carbon::now();

        // Проверка: процент скидки от 1 до 99
        if ($discountPercent < 1 || $discountPercent > 99) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'discount_percent' => ['Процент скидки должен быть от 1 до 99.'],
            ]);
        }

        // Проверка: дата начала должна быть в будущем или сегодня
        if ($discountStartAt->isPast() && $discountStartAt->format('Y-m-d') !== $now->format('Y-m-d')) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'discount_start_at' => ['Дата начала скидки должна быть сегодня или в будущем.'],
            ]);
        }

        // Проверка: дата окончания должна быть после даты начала
        if ($discountEndAt->lte($discountStartAt)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'discount_end_at' => ['Дата окончания скидки должна быть после даты начала.'],
            ]);
        }

        // Проверка: длительность скидки от 1 до 7 дней
        $durationDays = $discountStartAt->diffInDays($discountEndAt, false);
        if ($durationDays < 1 || $durationDays > 7) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'discount_end_at' => ['Скидка может действовать от 1 до 7 дней.'],
            ]);
        }

        // Проверка частоты установки скидки (не чаще раза в месяц)
        if ($watchface) {
            $lastDiscountEndAt = $watchface->discount_end_at;
            if ($lastDiscountEndAt && $lastDiscountEndAt->isPast()) {
                // Проверяем, прошло ли 30 дней с момента окончания последней скидки
                $daysSinceLastDiscount = $lastDiscountEndAt->diffInDays($now);
                if ($daysSinceLastDiscount < 30) {
                    $daysRemaining = 30 - $daysSinceLastDiscount;
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'discount' => ["Скидку можно устанавливать не чаще одного раза в месяц. С момента окончания последней скидки прошло {$daysSinceLastDiscount} дней. Следующую скидку можно установить через {$daysRemaining} дней."],
                    ]);
                }
            }
        }
    }
}

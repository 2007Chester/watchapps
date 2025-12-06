<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WatchfaceStatsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\WatchfaceController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\DeveloperOnboardingController;
use App\Http\Controllers\DeveloperStatsController;
use App\Http\Controllers\DeveloperReviewsController;
use App\Http\Controllers\RatingController;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

/*
|--------------------------------------------------------------------------
| Sanctum CSRF Cookie (для SPA аутентификации)
|--------------------------------------------------------------------------
*/

Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

/*
|--------------------------------------------------------------------------
| AUTH (Публичные методы)
|--------------------------------------------------------------------------
*/

Route::post('/auth/register',      [AuthController::class, 'register']);
Route::post('/auth/login',         [AuthController::class, 'login']);
Route::post('/auth/check-email',   [AuthController::class, 'checkEmail']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES (Общие для всех ролей)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // User info + logout
    Route::get('/auth/user',   [AuthController::class, 'user']);
    Route::post('/auth/logout',[AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | EMAIL VERIFICATION
    |--------------------------------------------------------------------------
    */
    Route::post('/auth/send-verification', [AuthController::class, 'sendVerification']);

    /*
    |--------------------------------------------------------------------------
    | DEVELOPER ONBOARDING (доступно без verified, но только для developer)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:developer')
        ->prefix('dev/onboarding')
        ->group(function () {
            Route::get('/', [DeveloperOnboardingController::class, 'show']);
            Route::put('/', [DeveloperOnboardingController::class, 'update']);
            Route::post('/complete', [DeveloperOnboardingController::class, 'complete']);
            Route::post('/change-password', [DeveloperOnboardingController::class, 'changePassword']);
        });

    /*
    |--------------------------------------------------------------------------
    | PAYMENT INFO (доступно без verified, но только для developer)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:developer')
        ->prefix('dev/payment')
        ->group(function () {
            Route::get('/', [DeveloperOnboardingController::class, 'getPaymentInfo']);
            Route::put('/', [DeveloperOnboardingController::class, 'updatePaymentInfo']);
            Route::post('/send-for-approval', [DeveloperOnboardingController::class, 'sendPaymentForApproval']);
        });
});

/*
|--------------------------------------------------------------------------
| ROUTES FOR VERIFIED ACCOUNTS
|--------------------------------------------------------------------------
|
| Любые действия, которые должны работать только после подтверждения email,
| пишем здесь. Это защищает от покупок / загрузок / dev console без верификации.
|
*/

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Upload API
    |--------------------------------------------------------------------------
    */
    Route::post('/upload',   [UploadController::class, 'store']);
    Route::post('/upload/parse-apk', [UploadController::class, 'parseApk']);
    Route::get('/uploads',   [UploadController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | PURCHASE API
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/purchase', [PurchaseController::class, 'purchase']);
        // Получить APK файл для установки (после покупки)
        Route::get('/watchfaces/{id}/apk', [PurchaseController::class, 'getApk']);
    });

    /*
    |--------------------------------------------------------------------------
    | DEV CONSOLE (только для роли developer + verified)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'verified', 'role:developer'])
     ->prefix('dev')
     ->group(function () {

              // Категории
              Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);

              // Общая статистика разработчика
              Route::get('/statistics', [DeveloperStatsController::class, 'index']);

              // Отзывы на приложения разработчика
              Route::get('/reviews', [DeveloperReviewsController::class, 'index']);

              // Статистика по циферблату
              Route::get('/watchfaces/{id}/stats', [WatchfaceStatsController::class, 'stats']);

              // Список всех watchfaces текущего разработчика
              Route::get('/watchfaces', [WatchfaceController::class, 'index']);

              // Создать watchface
              Route::post('/watchfaces', [WatchfaceController::class, 'store']);

              // Получить один watchface
              Route::get('/watchfaces/{id}', [WatchfaceController::class, 'show']);

              // Файлы
              Route::post('/watchfaces/{id}/files', [WatchfaceController::class, 'attachFiles']);
              Route::post('/watchfaces/{watchfaceId}/files/{fileId}/replace', [WatchfaceController::class, 'replaceFile']);
              Route::delete('/watchfaces/{watchfaceId}/files/{fileId}', [WatchfaceController::class, 'deleteFile']);

              // Обновить watchface
              Route::put('/watchfaces/{id}', [WatchfaceController::class, 'update']);

              // Удалить watchface
              Route::delete('/watchfaces/{id}', [WatchfaceController::class, 'destroy']);

              // Publish / Unpublish
              Route::post('/watchfaces/{id}/publish', [WatchfaceController::class, 'publish']);
              Route::post('/watchfaces/{id}/unpublish', [WatchfaceController::class, 'unpublish']);
      });

});

/*
|--------------------------------------------------------------------------
| EMAIL CONFIRM (public callback)
|--------------------------------------------------------------------------
*/

Route::get("/auth/verify/{token}", [AuthController::class, "verifyEmail"]);

/*
|--------------------------------------------------------------------------
| PUBLIC CATALOG API
|--------------------------------------------------------------------------
*/

Route::get('/catalog/categories', [CatalogController::class, 'categories']);
Route::get('/catalog/search', [CatalogController::class, 'search']);
Route::get('/catalog/top',       [CatalogController::class, 'top']);
Route::get('/catalog/new',       [CatalogController::class, 'new']);
Route::get('/catalog/discounts', [CatalogController::class, 'discounts']);
Route::get('/catalog/category/{slug}', [CatalogController::class, 'byCategory']);

Route::get('/watchface/{slug}',  [CatalogController::class, 'show']);

// Отзывы (публичные - получение, авторизованные - создание)
Route::get('/watchface/{id}/ratings', [RatingController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/watchface/{id}/ratings', [RatingController::class, 'store']);
    Route::delete('/watchface/{id}/ratings/{ratingId}', [RatingController::class, 'destroy']);
    // Ответы разработчика на отзывы
    Route::post('/watchface/{id}/ratings/{ratingId}/reply', [RatingController::class, 'reply']);
    Route::delete('/watchface/{id}/ratings/{ratingId}/reply', [RatingController::class, 'deleteReply']);
});

/*
|--------------------------------------------------------------------------
| PUBLIC STATS API
|--------------------------------------------------------------------------
*/

Route::post('/watchface/{id}/log/view',  [WatchfaceStatsController::class, 'logView']);
Route::post('/watchface/{id}/log/click', [WatchfaceStatsController::class, 'logClick']);

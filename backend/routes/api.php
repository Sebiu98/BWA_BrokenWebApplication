<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminCommentController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Support\Facades\Route;

// Rotte pubbliche (catalogo + auth base).
Route::get('/health', HealthController::class);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/comments', [CommentController::class, 'index']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Rotte protette: token JWT valido + utente attivo.
Route::middleware(['auth.jwt', EnsureUserIsActive::class])->group(function () {
    // Sessione utente.
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin utenti.
    Route::get('/users', [UserController::class, 'index']);
    Route::put('/users/{id}', [UserController::class, 'update'])->whereNumber('id');
    Route::patch('/users/{id}/toggle-active', [UserController::class, 'toggleActive'])->whereNumber('id');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->whereNumber('id');

    // Admin prodotti.
    Route::get('/admin/products', [AdminProductController::class, 'index']);
    Route::post('/admin/products', [AdminProductController::class, 'store']);
    Route::put('/admin/products/{id}', [AdminProductController::class, 'update'])->whereNumber('id');
    Route::patch('/admin/products/{id}/toggle-enabled', [AdminProductController::class, 'toggleEnabled'])->whereNumber('id');
    Route::delete('/admin/products/{id}', [AdminProductController::class, 'destroy'])->whereNumber('id');

    // Ordini + commenti autenticati.
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/me', [OrderController::class, 'myOrders']);
    Route::get('/orders/admin', [OrderController::class, 'adminOrders']);
    Route::get('/orders/{id}', [OrderController::class, 'show'])->whereNumber('id');
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->whereNumber('id');
    Route::post('/products/{id}/comments', [CommentController::class, 'store'])->whereNumber('id');
    Route::delete('/comments/{id}', [AdminCommentController::class, 'destroy'])->whereNumber('id');
});

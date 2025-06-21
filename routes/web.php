<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\GeminiApiController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\LandingPageController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingPageController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        if (Auth::user()->is_admin) {
            return Redirect::route('dashboard.analytics');
        }
        return Redirect::route('customer.dashboard.analytics');
    })->name('dashboard');

    Route::middleware(['admin'])->group(function () {
        Route::get('/dashboard/analytics', [ProductController::class, 'analytics'])->name('dashboard.analytics');
    });

    Route::get('/dashboard/customer', [ProductController::class, 'customerAnalytics'])->name('customer.dashboard.analytics');

    Route::get('products.dashboard', function () {
        if (Auth::user()->is_admin) {
            return Redirect::route('dashboard.products');
        }
        return Redirect::route('products.index');
    })->name('products.dashboard');

    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show')->where('id', '[0-9]+');
    Route::get('/products/{product}/edit', [ProductController::class, 'create'])->name('products.edit');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::get('/dashboard/products', [ProductController::class, 'ProductDashboard'])->name('dashboard.products');
    Route::post('/products/generate-description', [GeminiApiController::class, 'generateDescription'])->name('products.generate-description');

    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{cart}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])->name('cart.destroy');

    Route::apiResource('orders', OrderController::class);
    Route::apiResource('recommendations', RecommendationController::class);
    Route::get('recommendations/user', [RecommendationController::class, 'getUserRecommendations'])->name('recommendations.user');
    Route::apiResource('chat-messages', ChatMessageController::class);
    Route::get('chat-messages/history', [ChatMessageController::class, 'getUserChatHistory']);

    Route::get('/support/chat', [ChatbotController::class, 'index'])->name('chat.index');
    Route::post('/support/chat', [ChatbotController::class, 'sendMessage'])->name('chat.send');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

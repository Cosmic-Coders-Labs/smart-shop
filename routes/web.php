<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\LandingPageController;

Route::get('/', [LandingPageController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // add others urls
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);
    Route::apiResource('recommendations', RecommendationController::class);
    Route::get('recommendations/user', [RecommendationController::class, 'getUserRecommendations']);
    Route::apiResource('chat-messages', ChatMessageController::class);
    Route::get('chat-messages/history', [ChatMessageController::class, 'getUserChatHistory']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

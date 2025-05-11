<?php

use App\Http\Controllers\CartController;
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
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('products.show')->where('id', '[0-9]+');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware(['auth']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware(['auth']);
    //Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');


    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{cart}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/{cart}', [CartController::class, 'destroy'])->name('cart.destroy');

    Route::apiResource('orders', OrderController::class);
    Route::apiResource('recommendations', RecommendationController::class);
    Route::get('recommendations/user', [RecommendationController::class, 'getUserRecommendations']);
    Route::apiResource('chat-messages', ChatMessageController::class);
    Route::get('chat-messages/history', [ChatMessageController::class, 'getUserChatHistory']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

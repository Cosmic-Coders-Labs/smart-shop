<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Order;
use App\Policies\OrderPolicy;

class AppServiceProvider extends ServiceProvider
{

    protected $policies = [
        Order::class => OrderPolicy::class,
    ];
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

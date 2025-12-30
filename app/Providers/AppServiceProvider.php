<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
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
        // Force HTTPS in production to prevent Mixed Content errors
        if (app()->environment('production') || !str_starts_with(config('app.url'), 'http://localhost')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
    }
}

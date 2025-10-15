<?php
// ============================================================================
// app/Providers/AppServiceProvider.php - ÚNICO PROVIDER NECESARIO EN LARAVEL 11
// ============================================================================
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
        //
    }
}
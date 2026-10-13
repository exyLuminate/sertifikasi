<?php

namespace App\Providers;

use App\Services\OrderService;
use App\Services\Surcharges\ServiceChargeSurcharge;
use App\Services\Surcharges\TaxSurcharge;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(OrderService::class, function () {
            return new OrderService([
                'tax' => new TaxSurcharge((float) config('restaurant.tax_percent', 10)),
                'service_charge' => new ServiceChargeSurcharge((float) config('restaurant.service_percent', 5)),
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}

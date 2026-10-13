<?php

namespace App\Services\Surcharges;

use App\Contracts\SurchargeInterface;

/**
 * Biaya layanan restoran (Unit 4: Polymorphism).
 */
class ServiceChargeSurcharge implements SurchargeInterface
{
    public function __construct(private float $percent) {}

    public function label(): string
    {
        return 'Biaya layanan';
    }

    public function calculate(float $subtotal): float
    {
        return round($subtotal * $this->percent / 100, 2);
    }
}

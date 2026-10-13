<?php

namespace App\Services\Surcharges;

use App\Contracts\SurchargeInterface;

/**
 * Biaya pajak restoran (Unit 4: Polymorphism).
 */
class TaxSurcharge implements SurchargeInterface
{
    public function __construct(private float $percent) {}

    public function label(): string
    {
        return 'Pajak';
    }

    public function calculate(float $subtotal): float
    {
        return round($subtotal * $this->percent / 100, 2);
    }
}

<?php

namespace App\Contracts;

/**
 * Kontrak biaya tambahan untuk pesanan restoran (Unit 4: OOP & Polymorphism).
 * Menerapkan Open/Closed Principle: penambahan jenis biaya baru
 * cukup membuat class baru yang mengimplementasikan interface ini.
 */
interface SurchargeInterface
{
    /**
     * Label / nama biaya tambahan (misal: Pajak, Biaya Layanan).
     */
    public function label(): string;

    /**
     * Hitung nilai biaya tambahan berdasarkan subtotal pesanan.
     */
    public function calculate(float $subtotal): float;
}

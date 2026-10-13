<?php

namespace Tests\Unit;

use App\Contracts\SurchargeInterface;
use App\Services\OrderService;
use App\Services\Surcharges\ServiceChargeSurcharge;
use App\Services\Surcharges\TaxSurcharge;
use PHPUnit\Framework\TestCase;

/**
 * Unit Test OrderService — Menguji method murni perhitungan pesanan tanpa database (Unit 3 & 4).
 */
class OrderServiceTest extends TestCase
{
    private OrderService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new OrderService([
            'tax' => new TaxSurcharge(10), // 10%
            'service_charge' => new ServiceChargeSurcharge(5), // 5%
        ]);
    }

    /**
     * Uji perhitungan subtotal pesanan (Unit 3).
     */
    public function test_hitung_subtotal_secara_akurat(): void
    {
        $lines = [
            ['price' => 25000, 'qty' => 2], // 50.000
            ['price' => 50000, 'qty' => 1], // 50.000
        ];

        $subtotal = $this->service->calculateSubtotal($lines);

        $this->assertSame(100000.0, $subtotal);
    }

    /**
     * Uji perhitungan pajak 10% dan biaya layanan 5% dari subtotal (Unit 3 & 4).
     */
    public function test_hitung_surcharges_pajak_dan_layanan(): void
    {
        $subtotal = 100000.0;
        $surcharges = $this->service->calculateSurcharges($subtotal);

        $this->assertArrayHasKey('tax', $surcharges);
        $this->assertArrayHasKey('service_charge', $surcharges);

        $this->assertSame(10000.0, $surcharges['tax']); // 10% dari 100.000
        $this->assertSame(5000.0, $surcharges['service_charge']); // 5% dari 100.000
    }

    /**
     * Uji perhitungan total keseluruhan (subtotal + pajak + layanan) (Unit 3).
     */
    public function test_hitung_total_keseluruhan(): void
    {
        $subtotal = 100000.0;
        $total = $this->service->calculateTotal($subtotal);

        // 100.000 + 10.000 + 5.000 = 115.000
        $this->assertSame(115000.0, $total);
    }

    /**
     * Uji penggabungan menu kembar: menu yang sama ditambah dua kali kuantitasnya digabung (Hal. 57).
     */
    public function test_merge_items_menggabungkan_menu_kembar_dan_menjumlahkan_qty(): void
    {
        $rawItems = [
            ['menu_id' => 1, 'qty' => 2, 'note' => 'tidak pedas'],
            ['menu_id' => 2, 'qty' => 1, 'note' => null],
            ['menu_id' => 1, 'qty' => 3, 'note' => 'pedas sedang'],
        ];

        $merged = $this->service->mergeItems($rawItems);

        $this->assertCount(2, $merged);
        $this->assertSame(5, $merged[1]['qty']); // 2 + 3 = 5
        $this->assertSame(1, $merged[2]['qty']);
        $this->assertStringContainsString('tidak pedas', $merged[1]['note']);
        $this->assertStringContainsString('pedas sedang', $merged[1]['note']);
    }

    /**
     * Uji polimorfisme: OrderService dapat menerima implementasi SurchargeInterface apa pun (Unit 4).
     */
    public function test_surcharge_polymorphism_mendukung_implementasi_kustom(): void
    {
        $customSurcharge = new class implements SurchargeInterface
        {
            public function label(): string
            {
                return 'Biaya Ramah Lingkungan';
            }

            public function calculate(float $subtotal): float
            {
                return 2500.0; // Biaya flat
            }
        };

        $serviceWithCustom = new OrderService([
            'eco_fee' => $customSurcharge,
        ]);

        $subtotal = 50000.0;
        $surcharges = $serviceWithCustom->calculateSurcharges($subtotal);
        $total = $serviceWithCustom->calculateTotal($subtotal);

        $this->assertSame(2500.0, $surcharges['eco_fee']);
        $this->assertSame(52500.0, $total);
    }
}

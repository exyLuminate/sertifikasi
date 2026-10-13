<?php

namespace Tests\Unit;

use App\Enums\ReservationStatus;
use App\Models\RestaurantTable;
use App\Services\ReservationService;
use Carbon\Carbon;
use InvalidArgumentException;
use Tests\TestCase;

/**
 * Unit Test untuk method murni ReservationService tanpa database (Unit 3 & Unit 9).
 */
class ReservationServiceTest extends TestCase
{
    private ReservationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReservationService;
    }

    /**
     * Uji 1: Jadwal berurutan (selesai tepat saat yang lain mulai) TIDAK bentrok (Hal. 35, 54).
     */
    public function test_reservasi_berurutan_tidak_bentrok(): void
    {
        $a1 = Carbon::parse('2026-10-20 18:00');
        $a2 = Carbon::parse('2026-10-20 20:00');
        $b1 = Carbon::parse('2026-10-20 20:00'); // Mulai tepat saat A selesai
        $b2 = Carbon::parse('2026-10-20 22:00');

        $this->assertFalse($this->service->isOverlapping($a1, $a2, $b1, $b2));
    }

    /**
     * Uji 2: Jadwal beririsan di jam yang sama HARUS terdeteksi bentrok.
     */
    public function test_reservasi_beririsan_terdeteksi_bentrok(): void
    {
        $a1 = Carbon::parse('2026-10-20 18:00');
        $a2 = Carbon::parse('2026-10-20 20:00');
        $b1 = Carbon::parse('2026-10-20 19:00'); // Mulai di tengah jadwal A
        $b2 = Carbon::parse('2026-10-20 21:00');

        $this->assertTrue($this->service->isOverlapping($a1, $a2, $b1, $b2));
    }

    /**
     * Uji 3: Jumlah tamu melebihi kapasitas meja melempar exception (Hal. 35).
     */
    public function test_tamu_melebihi_kapasitas_melempar_exception(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('melebihi kapasitas');

        $this->service->validateGuestCount(4, 6);
    }

    /**
     * Uji 4: Jumlah tamu kurang dari 1 melempar exception.
     */
    public function test_tamu_kurang_dari_satu_melempar_exception(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service->validateGuestCount(4, 0);
    }

    /**
     * Uji 5: Perhitungan jam selesai otomatis bertambah 120 menit (2 jam).
     */
    public function test_hitung_jam_selesai_otomatis(): void
    {
        $start = Carbon::parse('2026-10-20 14:00');
        $end = $this->service->calculateEndTime($start);

        $this->assertEquals('16:00', $end->format('H:i'));
    }

    /**
     * Uji 6: Waktu di luar jam operasional (10:00 - 22:00) ditolak (Hal. 53, 54).
     */
    public function test_jam_di_luar_operasional_ditolak(): void
    {
        // Jam buka 10:00, jam tutup 22:00
        $earlyStart = Carbon::parse('2026-10-20 08:00');
        $earlyEnd = Carbon::parse('2026-10-20 10:00');
        $this->assertFalse($this->service->isWithinOperatingHours($earlyStart, $earlyEnd));

        $lateStart = Carbon::parse('2026-10-20 21:00');
        $lateEnd = Carbon::parse('2026-10-20 23:00'); // Melewati jam 22:00
        $this->assertFalse($this->service->isWithinOperatingHours($lateStart, $lateEnd));

        $validStart = Carbon::parse('2026-10-20 12:00');
        $validEnd = Carbon::parse('2026-10-20 14:00');
        $this->assertTrue($this->service->isWithinOperatingHours($validStart, $validEnd));
    }

    /**
     * Uji 7: Menyaring meja tersedia secara murni dengan perulangan (Unit 3).
     */
    public function test_filter_available_tables_murni(): void
    {
        $t1 = new RestaurantTable(['code' => 'T1', 'capacity' => 2, 'is_active' => true]);
        $t1->id = 1;

        $t2 = new RestaurantTable(['code' => 'T2', 'capacity' => 4, 'is_active' => true]);
        $t2->id = 2;

        $t3 = new RestaurantTable(['code' => 'T3', 'capacity' => 6, 'is_active' => false]); // Nonaktif
        $t3->id = 3;

        $bookedIds = [1]; // Meja 1 sudah dipesan

        $available = $this->service->filterAvailableTables([$t1, $t2, $t3], 4, $bookedIds);

        // Hanya Meja 2 yang aktif, muat minimal 4 orang, dan tidak ada di bookedIds
        $this->assertCount(1, $available);
        $this->assertEquals('T2', $available[0]->code);
    }

    /**
     * Uji 8: Transisi status enum: Dipesan -> Dikonfirmasi -> Selesai valid, Dipesan -> Selesai tidak valid.
     */
    public function test_transisi_status_enum(): void
    {
        $this->assertTrue(ReservationStatus::Dipesan->canTransitionTo(ReservationStatus::Dikonfirmasi));
        $this->assertTrue(ReservationStatus::Dipesan->canTransitionTo(ReservationStatus::Dibatalkan));
        $this->assertFalse(ReservationStatus::Dipesan->canTransitionTo(ReservationStatus::Selesai));

        $this->assertTrue(ReservationStatus::Dikonfirmasi->canTransitionTo(ReservationStatus::Selesai));
        $this->assertFalse(ReservationStatus::Selesai->canTransitionTo(ReservationStatus::Dipesan));
    }
}

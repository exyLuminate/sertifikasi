<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;

    private Customer $customer;

    private RestaurantTable $table;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = User::factory()->create([
            'role' => Role::Staf,
            'is_active' => true,
        ]);

        $this->customer = Customer::create([
            'name' => 'Pelanggan Uji',
            'phone' => '081234567890',
        ]);

        $this->table = RestaurantTable::create([
            'code' => 'T01',
            'capacity' => 4,
            'location' => 'indoor',
            'is_active' => true,
        ]);
    }

    /**
     * Skenario 1: Staf dapat membuat reservasi dan kode RSV-YYYYMMDD-NNNN terbentuk
     */
    public function test_staf_dapat_membuat_reservasi_dan_kode_terbentuk(): void
    {
        $tomorrowNoon = now()->addDay()->setTime(12, 0);

        $response = $this->actingAs($this->staff)->post(route('reservations.store'), [
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'start_at' => $tomorrowNoon->format('Y-m-d H:i'),
            'guest_count' => 3,
            'note' => 'Dekat jendela',
        ]);

        $response->assertSessionHas('success');

        $reservation = Reservation::first();
        $this->assertNotNull($reservation);
        $this->assertEquals(ReservationStatus::Dipesan, $reservation->status);
        $this->assertStringStartsWith('RSV-'.now()->format('Ymd').'-', $reservation->code);
        $this->assertEquals('14:00', $reservation->end_at->format('H:i')); // Otomatis 2 jam
    }

    /**
     * Skenario 2: Jadwal beririsan pada meja yang sama ditolak .
     */
    public function test_jadwal_beririsan_pada_meja_sama_ditolak(): void
    {
        $tomorrow = now()->addDay();
        $start1 = $tomorrow->copy()->setTime(12, 0);

        // Buat reservasi pertama: 12:00 - 14:00
        Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261020-0001',
            'start_at' => $start1,
            'end_at' => $start1->copy()->addHours(2),
            'guest_count' => 2,
            'status' => ReservationStatus::Dipesan,
        ]);

        // Percobaan reservasi kedua di jam beririsan: 13:00
        $start2 = $tomorrow->copy()->setTime(13, 0);
        $response = $this->actingAs($this->staff)->post(route('reservations.store'), [
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'start_at' => $start2->format('Y-m-d H:i'),
            'guest_count' => 2,
        ]);

        $response->assertSessionHas('error');
        $this->assertCount(1, Reservation::all());
    }

    /**
     * Skenario 3: Jadwal berurutan (selesai tepat saat yang lain mulai) DITERIMA .
     */
    public function test_jadwal_berurutan_pada_meja_sama_diterima(): void
    {
        $tomorrow = now()->addDay();
        $start1 = $tomorrow->copy()->setTime(12, 0);

        // Reservasi 1: 12:00 - 14:00
        Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261020-0001',
            'start_at' => $start1,
            'end_at' => $start1->copy()->addHours(2),
            'guest_count' => 2,
            'status' => ReservationStatus::Dipesan,
        ]);

        // Reservasi 2: Mulai tepat jam 14:00 saat reservasi 1 selesai
        $start2 = $tomorrow->copy()->setTime(14, 0);
        $response = $this->actingAs($this->staff)->post(route('reservations.store'), [
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'start_at' => $start2->format('Y-m-d H:i'),
            'guest_count' => 2,
        ]);

        $response->assertSessionHas('success');
        $this->assertCount(2, Reservation::all());
    }

    /**
     * Skenario 4: Jam di luar operasional (10:00 - 22:00) ditolak saat simpan (Hal. 53).
     */
    public function test_jam_di_luar_operasional_ditolak_saat_simpan(): void
    {
        $tomorrow = now()->addDay();
        // Jam 21:00 (durasi 2 jam akan selesai jam 23:00, melebihi jam tutup 22:00)
        $lateStart = $tomorrow->copy()->setTime(21, 0);

        $response = $this->actingAs($this->staff)->post(route('reservations.store'), [
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'start_at' => $lateStart->format('Y-m-d H:i'),
            'guest_count' => 2,
        ]);

        $response->assertSessionHas('error');
        $this->assertCount(0, Reservation::all());
    }

    /**
     * Skenario 5: Alur status konfirmasi dan selesaikan (Hal. 54).
     */
    public function test_alur_status_konfirmasi_dan_selesaikan(): void
    {
        $reservation = Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261020-0001',
            'start_at' => now()->addDay()->setTime(12, 0),
            'end_at' => now()->addDay()->setTime(14, 0),
            'guest_count' => 2,
            'status' => ReservationStatus::Dipesan,
        ]);

        // 1. Konfirmasi
        $response = $this->actingAs($this->staff)->post(route('reservations.confirm', $reservation));
        $response->assertSessionHas('success');
        $this->assertEquals(ReservationStatus::Dikonfirmasi, $reservation->fresh()->status);

        // 2. Selesaikan
        $response = $this->actingAs($this->staff)->post(route('reservations.complete', $reservation));
        $response->assertSessionHas('success');
        $this->assertEquals(ReservationStatus::Selesai, $reservation->fresh()->status);
    }

    /**
     * Skenario 6: Pembatalan reservasi membatalkan pesanan aktif dalam satu DB transaction (Hal. 54, 62).
     */
    public function test_pembatalan_reservasi_membatalkan_pesanan_aktif(): void
    {
        $reservation = Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261020-0001',
            'start_at' => now()->addDay()->setTime(12, 0),
            'end_at' => now()->addDay()->setTime(14, 0),
            'guest_count' => 2,
            'status' => ReservationStatus::Dikonfirmasi,
        ]);

        $order = Order::create([
            'reservation_id' => $reservation->id,
            'user_id' => $this->staff->id,
            'order_number' => 'ORD-20261020-0001',
            'subtotal' => 50000,
            'tax' => 5000,
            'service_charge' => 2500,
            'total' => 57500,
            'status' => OrderStatus::Dibuat,
        ]);

        $response = $this->actingAs($this->staff)->post(route('reservations.cancel', $reservation));
        $response->assertSessionHas('success');

        $this->assertEquals(ReservationStatus::Dibatalkan, $reservation->fresh()->status);
        $this->assertEquals(OrderStatus::Dibatalkan, $order->fresh()->status);
    }

    /**
     * Skenario 7: Selesaikan reservasi yang masih punya pesanan aktif DITOLAK .
     */
    public function test_selesaikan_reservasi_dengan_pesanan_aktif_ditolak(): void
    {
        $reservation = Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261020-0001',
            'start_at' => now()->addDay()->setTime(12, 0),
            'end_at' => now()->addDay()->setTime(14, 0),
            'guest_count' => 2,
            'status' => ReservationStatus::Dikonfirmasi,
        ]);

        Order::create([
            'reservation_id' => $reservation->id,
            'user_id' => $this->staff->id,
            'order_number' => 'ORD-20261020-0001',
            'subtotal' => 50000,
            'tax' => 5000,
            'service_charge' => 2500,
            'total' => 57500,
            'status' => OrderStatus::Dibuat, // Masih aktif/belum selesai
        ]);

        $response = $this->actingAs($this->staff)->post(route('reservations.complete', $reservation));
        $response->assertSessionHas('error');

        $this->assertEquals(ReservationStatus::Dikonfirmasi, $reservation->fresh()->status);
    }
}

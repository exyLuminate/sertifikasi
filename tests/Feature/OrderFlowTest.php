<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Models\Customer;
use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature Test Alur Pesanan (Phase 5: Unit 3, 4, 6, 9).
 */
class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $staff;

    private Customer $customer;

    private RestaurantTable $table;

    private Reservation $confirmedReservation;

    private MenuCategory $category;

    private Menu $menu1;

    private Menu $menu2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->staff = User::factory()->create(['role' => Role::Staf]);

        $this->customer = Customer::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'email' => 'budi@example.com',
        ]);

        $this->table = RestaurantTable::create([
            'code' => 'T01',
            'capacity' => 4,
            'location' => 'indoor',
            'is_active' => true,
        ]);

        $this->confirmedReservation = Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261012-0001',
            'start_at' => now()->addDays(2)->setTime(12, 0),
            'end_at' => now()->addDays(2)->setTime(14, 0),
            'guest_count' => 2,
            'status' => ReservationStatus::Dikonfirmasi,
        ]);

        $this->category = MenuCategory::create([
            'name' => 'Makanan Utama',
        ]);

        $this->menu1 = Menu::create([
            'menu_category_id' => $this->category->id,
            'name' => 'Nasi Goreng Spesial',
            'price' => 25000,
            'is_available' => true,
        ]);

        $this->menu2 = Menu::create([
            'menu_category_id' => $this->category->id,
            'name' => 'Ayam Bakar Madu',
            'price' => 50000,
            'is_available' => true,
        ]);
    }

    /**
     * Skenario 1: Pesanan valid dengan hitungan subtotal, pajak 10%, layanan 5%, dan total akurat (Hal. 55-57).
     */
    public function test_staf_dapat_membuat_pesanan_dengan_hitungan_pajak_dan_layanan_benar(): void
    {
        // 2x Nasi Goreng (50.000) + 1x Ayam Bakar (50.000) = Subtotal 100.000
        $response = $this->actingAs($this->staff)->post(route('orders.store'), [
            'reservation_id' => $this->confirmedReservation->id,
            'items' => [
                ['menu_id' => $this->menu1->id, 'qty' => 2, 'note' => 'Pedas level 1'],
                ['menu_id' => $this->menu2->id, 'qty' => 1, 'note' => 'Paha'],
            ],
        ]);

        $order = Order::latest()->first();

        $this->assertNotNull($order);
        $response->assertRedirect(route('orders.show', $order));

        $this->assertEquals(100000.00, (float) $order->subtotal);
        $this->assertEquals(10000.00, (float) $order->tax);            // 10% dari 100.000
        $this->assertEquals(5000.00, (float) $order->service_charge);  // 5% dari 100.000
        $this->assertEquals(115000.00, (float) $order->total);         // 100.000 + 10.000 + 5.000
        $this->assertSame(OrderStatus::Dibuat, $order->status);
        $this->assertStringStartsWith('ORD-', $order->order_number);

        // Verifikasi item pesanan
        $this->assertCount(2, $order->items);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'menu_id' => $this->menu1->id,
            'price_at_order' => 25000.00,
            'qty' => 2,
            'subtotal' => 50000.00,
        ]);
    }

    /**
     * Skenario 2: Pesanan pada reservasi yang belum dikonfirmasi (misal: masih 'dipesan') DITOLAK (Hal. 57).
     */
    public function test_pesanan_pada_reservasi_bukan_dikonfirmasi_ditolak(): void
    {
        $pendingReservation = Reservation::create([
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261012-0002',
            'start_at' => now()->addDays(3)->setTime(12, 0),
            'end_at' => now()->addDays(3)->setTime(14, 0),
            'guest_count' => 2,
            'status' => ReservationStatus::Dipesan, // Belum dikonfirmasi
        ]);

        $response = $this->actingAs($this->staff)->post(route('orders.store'), [
            'reservation_id' => $pendingReservation->id,
            'items' => [
                ['menu_id' => $this->menu1->id, 'qty' => 1],
            ],
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseCount('orders', 0);
    }

    /**
     * Skenario 3: Menu tidak tersedia (is_available = false) DITOLAK (Hal. 57).
     */
    public function test_memesan_menu_yang_tidak_tersedia_ditolak(): void
    {
        $unavailableMenu = Menu::create([
            'menu_category_id' => $this->category->id,
            'name' => 'Es Krim Durian',
            'price' => 15000,
            'is_available' => false, // Kosong / habis
        ]);

        $response = $this->actingAs($this->staff)->post(route('orders.store'), [
            'reservation_id' => $this->confirmedReservation->id,
            'items' => [
                ['menu_id' => $unavailableMenu->id, 'qty' => 1],
            ],
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseCount('orders', 0);
    }

    /**
     * Skenario 4: Menu yang sama ditambah dua kali kuantitasnya digabung (Hal. 57).
     */
    public function test_menu_kembar_kuantitasnya_digabung(): void
    {
        $this->actingAs($this->staff)->post(route('orders.store'), [
            'reservation_id' => $this->confirmedReservation->id,
            'items' => [
                ['menu_id' => $this->menu1->id, 'qty' => 2, 'note' => 'Pedas'],
                ['menu_id' => $this->menu1->id, 'qty' => 3, 'note' => 'Tidak pedas'],
            ],
        ]);

        $order = Order::latest()->first();

        $this->assertNotNull($order);
        $this->assertCount(1, $order->items);
        $this->assertSame(5, $order->items->first()->qty); // 2 + 3 = 5
        $this->assertEquals(125000.00, (float) $order->items->first()->subtotal);
    }

    /**
     * Skenario 5: Harga menu diubah setelah pesanan dibuat, pesanan lama tetap memakai harga lama (Hal. 57).
     */
    public function test_perubahan_harga_menu_tidak_merusak_harga_pesanan_lama(): void
    {
        $this->actingAs($this->staff)->post(route('orders.store'), [
            'reservation_id' => $this->confirmedReservation->id,
            'items' => [
                ['menu_id' => $this->menu1->id, 'qty' => 1],
            ],
        ]);

        $order = Order::latest()->first();
        $this->assertEquals(25000.00, (float) $order->items->first()->price_at_order);

        // Ubah harga menu di master data dari 25.000 menjadi 40.000
        $this->menu1->update(['price' => 40000]);

        // Muat ulang pesanan lama dari database
        $order->refresh();
        $this->assertEquals(25000.00, (float) $order->items->first()->price_at_order);
        $this->assertEquals(25000.00, (float) $order->subtotal);
    }

    /**
     * Skenario 6: Selesaikan pesanan lalu coba batalkan DITOLAK (Hal. 57).
     */
    public function test_pesanan_selesai_tidak_dapat_dibatalkan(): void
    {
        $this->actingAs($this->staff)->post(route('orders.store'), [
            'reservation_id' => $this->confirmedReservation->id,
            'items' => [
                ['menu_id' => $this->menu1->id, 'qty' => 1],
            ],
        ]);

        $order = Order::latest()->first();

        // 1. Selesaikan pesanan
        $responseComplete = $this->actingAs($this->staff)->post(route('orders.complete', $order));
        $responseComplete->assertSessionHas('success');
        $this->assertSame(OrderStatus::Selesai, $order->fresh()->status);

        // 2. Coba batalkan pesanan yang sudah selesai -> Ditolak!
        $responseCancel = $this->actingAs($this->staff)->post(route('orders.cancel', $order));
        $responseCancel->assertSessionHas('error');
        $this->assertSame(OrderStatus::Selesai, $order->fresh()->status);
    }
}

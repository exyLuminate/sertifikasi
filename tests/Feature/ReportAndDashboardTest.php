<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Models\Customer;
use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use App\Services\ReportService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * ReportAndDashboardTest — Pengujian otomatis untuk Laporan, PDF, dan Dashboard (Unit 5 & 6).
 */
class ReportAndDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $staf;

    protected Customer $customer;

    protected RestaurantTable $table;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
        ]);

        $this->staf = User::factory()->create([
            'role' => Role::Staf,
        ]);

        $this->customer = Customer::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
        ]);

        $this->table = RestaurantTable::create([
            'code' => 'T01',
            'capacity' => 4,
            'location' => 'Indoor',
            'is_active' => true,
        ]);
    }

    public function test_admin_melihat_dashboard_dengan_metrik_agregat(): void
    {
        $this->actingAs($this->admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('role', 'admin')
                ->has('summary')
                ->has('revenue')
                ->has('dailyReservations')
                ->has('activeTables')
            );
    }

    public function test_staf_melihat_dashboard_dengan_fokus_operasional_hari_ini(): void
    {
        $this->actingAs($this->staf)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('role', 'staf')
                ->has('todayReservations')
                ->has('runningOrders')
                ->has('activeTables')
            );
    }

    public function test_staf_tidak_bisa_mengakses_halaman_laporan(): void
    {
        $this->actingAs($this->staf)
            ->get('/reports')
            ->assertForbidden();
    }

    public function test_admin_dapat_mengakses_halaman_laporan_dan_filter_periode(): void
    {
        $this->actingAs($this->admin)
            ->get('/reports?period=7_days')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Reports/Index')
                ->where('period', '7_days')
                ->has('summary')
                ->has('tableUsage')
                ->has('dailyReservations')
                ->has('topMenus')
                ->has('revenue')
            );
    }

    public function test_laporan_pendapatan_hanya_menghitung_pesanan_selesai(): void
    {
        $category = MenuCategory::create(['name' => 'Makanan']);
        $menu = Menu::create([
            'menu_category_id' => $category->id,
            'name' => 'Nasi Goreng Spesial',
            'price' => 50000,
            'is_available' => true,
        ]);

        $reservation = Reservation::create([
            'user_id' => $this->staf->id,
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'code' => 'RSV-TEST-01',
            'guest_count' => 2,
            'start_at' => now(),
            'end_at' => now()->addHours(2),
            'status' => ReservationStatus::Dikonfirmasi,
        ]);

        // Pesanan selesai -> harus masuk revenue
        $completedOrder = Order::create([
            'reservation_id' => $reservation->id,
            'user_id' => $this->staf->id,
            'order_number' => 'ORD-001',
            'subtotal' => 100000,
            'tax' => 10000,
            'service_charge' => 5000,
            'total' => 115000,
            'status' => OrderStatus::Selesai,
        ]);
        OrderItem::create([
            'order_id' => $completedOrder->id,
            'menu_id' => $menu->id,
            'price_at_order' => 50000,
            'qty' => 2,
            'subtotal' => 100000,
        ]);

        // Pesanan dibuat / aktif -> TIDAK boleh masuk revenue
        Order::create([
            'reservation_id' => $reservation->id,
            'user_id' => $this->staf->id,
            'order_number' => 'ORD-002',
            'subtotal' => 50000,
            'tax' => 5000,
            'service_charge' => 2500,
            'total' => 57500,
            'status' => OrderStatus::Dibuat,
        ]);

        // Pesanan dibatalkan -> TIDAK boleh masuk revenue
        Order::create([
            'reservation_id' => $reservation->id,
            'user_id' => $this->staf->id,
            'order_number' => 'ORD-003',
            'subtotal' => 80000,
            'tax' => 8000,
            'service_charge' => 4000,
            'total' => 92000,
            'status' => OrderStatus::Dibatalkan,
        ]);

        $reportService = app(ReportService::class);
        $revenue = $reportService->revenue(now()->startOfDay(), now()->endOfDay());

        $this->assertEquals(115000.0, $revenue);

        $topMenus = $reportService->topMenus(now()->startOfDay(), now()->endOfDay());
        $this->assertCount(1, $topMenus);
        $this->assertEquals(2, $topMenus->first()->total_qty);
    }

    public function test_grafik_reservasi_harian_mengisi_hari_kosong_dengan_angka_nol(): void
    {
        $from = Carbon::parse('2026-10-01');
        $to = Carbon::parse('2026-10-07'); // Rentang 7 hari

        // Buat 1 reservasi pada tanggal 2026-10-03
        Reservation::create([
            'user_id' => $this->staf->id,
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'code' => 'RSV-GRAFIK-01',
            'guest_count' => 3,
            'start_at' => Carbon::parse('2026-10-03 12:00:00'),
            'end_at' => Carbon::parse('2026-10-03 14:00:00'),
            'status' => ReservationStatus::Dikonfirmasi,
        ]);

        $reportService = app(ReportService::class);
        $daily = $reportService->dailyReservations($from, $to);

        $this->assertCount(7, $daily['labels']);
        $this->assertCount(7, $daily['values']);

        // Nilai pada tanggal 2026-10-03 (indeks 2) harus bernilai 1
        $this->assertEquals(0, $daily['values'][0]); // 1 Okt
        $this->assertEquals(0, $daily['values'][1]); // 2 Okt
        $this->assertEquals(1, $daily['values'][2]); // 3 Okt
        $this->assertEquals(0, $daily['values'][3]); // 4 Okt
        $this->assertEquals(0, $daily['values'][4]); // 5 Okt
        $this->assertEquals(0, $daily['values'][5]); // 6 Okt
        $this->assertEquals(0, $daily['values'][6]); // 7 Okt
    }

    public function test_ekspor_laporan_pdf_berhasil_menghasilkan_dokumen(): void
    {
        $response = $this->actingAs($this->admin)->get('/reports/pdf?period=today');

        $response->assertOk();
        $this->assertTrue(
            str_contains($response->headers->get('content-type', ''), 'application/pdf'),
            'Response header Content-Type harus berjenis application/pdf'
        );
    }

    public function test_ekspor_bukti_reservasi_pdf_berhasil_menghasilkan_dokumen(): void
    {
        $reservation = Reservation::create([
            'user_id' => $this->staf->id,
            'customer_id' => $this->customer->id,
            'restaurant_table_id' => $this->table->id,
            'code' => 'RSV-PDF-01',
            'guest_count' => 2,
            'start_at' => now(),
            'end_at' => now()->addHours(2),
            'status' => ReservationStatus::Dikonfirmasi,
        ]);

        $response = $this->actingAs($this->staf)->get("/reservations/{$reservation->id}/pdf");

        $response->assertOk();
        $this->assertTrue(
            str_contains($response->headers->get('content-type', ''), 'application/pdf'),
            'Response header Content-Type harus berjenis application/pdf'
        );
    }
}

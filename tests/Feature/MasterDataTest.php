<?php

namespace Tests\Feature;

use App\Enums\ReservationStatus;
use App\Enums\Role;
use App\Models\Customer;
use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
            'is_active' => true,
        ]);

        $this->staff = User::factory()->create([
            'role' => Role::Staf,
            'is_active' => true,
        ]);
    }

    /**
     * Skenario 1: Harga menu 0 atau negatif harus ditolak (Hal. 51).
     */
    public function test_menu_price_zero_or_negative_is_rejected(): void
    {
        $category = MenuCategory::create(['name' => 'Makanan Utama']);

        $response = $this->actingAs($this->admin)->post(route('menus.store'), [
            'menu_category_id' => $category->id,
            'name' => 'Nasi Goreng Spesial',
            'price' => 0, // Harga 0 harus ditolak
            'is_available' => true,
        ]);

        $response->assertSessionHasErrors('price');
        $this->assertDatabaseMissing('menus', ['name' => 'Nasi Goreng Spesial']);
    }

    /**
     * Skenario 2: Kapasitas meja 0 harus ditolak (Hal. 51).
     */
    public function test_table_capacity_zero_is_rejected(): void
    {
        $response = $this->actingAs($this->admin)->post(route('tables.store'), [
            'code' => 'T99',
            'capacity' => 0, // Kapasitas 0 harus ditolak
            'location' => 'indoor',
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('capacity');
        $this->assertDatabaseMissing('restaurant_tables', ['code' => 'T99']);
    }

    /**
     * Skenario 3: Nomor telepon pelanggan kembar harus ditolak (Hal. 51).
     */
    public function test_duplicate_customer_phone_is_rejected(): void
    {
        Customer::create([
            'name' => 'Pelanggan 1',
            'phone' => '08123456789',
        ]);

        $response = $this->actingAs($this->staff)->post(route('customers.store'), [
            'name' => 'Pelanggan 2',
            'phone' => '08123456789', // Nomor telepon kembar
        ]);

        $response->assertSessionHasErrors('phone');
    }

    /**
     * Skenario 4: Hapus meja yang punya reservasi mendatang ditolak (Hal. 51).
     */
    public function test_table_with_upcoming_reservations_cannot_be_deleted(): void
    {
        $table = RestaurantTable::create([
            'code' => 'T10',
            'capacity' => 4,
            'location' => 'indoor',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'name' => 'Pelanggan Uji',
            'phone' => '0899999999',
        ]);

        Reservation::create([
            'customer_id' => $customer->id,
            'restaurant_table_id' => $table->id,
            'user_id' => $this->staff->id,
            'code' => 'RSV-20261012-0001',
            'guest_count' => 2,
            'start_at' => now()->addDay(),
            'end_at' => now()->addDay()->addHours(2),
            'status' => ReservationStatus::Dipesan,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('tables.destroy', $table));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('restaurant_tables', ['id' => $table->id, 'deleted_at' => null]);
    }

    /**
     * Skenario 5: Hapus kategori yang punya menu ditolak (Hal. 51).
     */
    public function test_category_with_menus_cannot_be_deleted(): void
    {
        $category = MenuCategory::create(['name' => 'Minuman']);
        Menu::create([
            'menu_category_id' => $category->id,
            'name' => 'Es Teh Manis',
            'price' => 5000,
            'is_available' => true,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('menu-categories.destroy', $category));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('menu_categories', ['id' => $category->id, 'deleted_at' => null]);
    }

    /**
     * Skenario 6: Staf membuka /menus mendapat 403 (Hal. 51).
     */
    public function test_staff_cannot_access_menus_route(): void
    {
        $response = $this->actingAs($this->staff)->get(route('menus.index'));

        $response->assertStatus(403);
    }

    /**
     * Skenario 7: Admin tidak boleh menonaktifkan akunnya sendiri (Hal. 51).
     */
    public function test_admin_cannot_deactivate_self(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('users.destroy', $this->admin));

        $response->assertSessionHas('error');
        $this->assertTrue($this->admin->fresh()->is_active);
    }

    /**
     * Skenario 8: Pencarian pelanggan lewat query scope bekerja (Hal. 50-51).
     */
    public function test_customer_scope_search_works(): void
    {
        Customer::create(['name' => 'Budi Santoso', 'phone' => '0811111111']);
        Customer::create(['name' => 'Siti Aminah', 'phone' => '0822222222']);

        $foundByName = Customer::search('Budi')->get();
        $this->assertCount(1, $foundByName);
        $this->assertEquals('Budi Santoso', $foundByName->first()->name);

        $foundByPhone = Customer::search('0822')->get();
        $this->assertCount(1, $foundByPhone);
        $this->assertEquals('Siti Aminah', $foundByPhone->first()->name);
    }
}

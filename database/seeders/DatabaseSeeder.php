<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder utama aplikasi.
 *
 * Membuat akun admin, staf, serta master data awal (meja, menu, pelanggan)
 * agar sistem dapat langsung digunakan dan didemonstrasikan saat instalasi baru.
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Jalankan seeder database.
     */
    public function run(): void
    {
        // 1. Akun pengguna utama
        User::firstOrCreate(
            ['email' => 'admin@resto.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'staf@resto.com'],
            [
                'name' => 'Staf Restoran',
                'password' => Hash::make('password'),
                'role' => 'staf',
                'is_active' => true,
            ]
        );

        // 2. Master Meja Restoran
        $tables = [
            ['code' => 'T-01', 'capacity' => 4, 'location' => 'indoor', 'is_active' => true],
            ['code' => 'T-02', 'capacity' => 2, 'location' => 'indoor', 'is_active' => true],
            ['code' => 'T-03', 'capacity' => 6, 'location' => 'outdoor', 'is_active' => true],
            ['code' => 'VIP-01', 'capacity' => 8, 'location' => 'vip', 'is_active' => true],
        ];
        foreach ($tables as $table) {
            RestaurantTable::firstOrCreate(['code' => $table['code']], $table);
        }

        // 3. Kategori Menu
        $catFood = MenuCategory::firstOrCreate(['name' => 'Makanan Utama']);
        $catDrink = MenuCategory::firstOrCreate(['name' => 'Minuman']);
        $catDessert = MenuCategory::firstOrCreate(['name' => 'Camilan & Penutup']);

        // 4. Daftar Menu
        $menus = [
            ['menu_category_id' => $catFood->id, 'name' => 'Nasi Goreng Spesial', 'price' => 35000, 'description' => 'Nasi goreng dengan telur, suwir ayam, dan acar', 'is_available' => true],
            ['menu_category_id' => $catFood->id, 'name' => 'Ayam Bakar Madu', 'price' => 42000, 'description' => 'Ayam bakar bumbu madu gurih manis dengan sambal terasi', 'is_available' => true],
            ['menu_category_id' => $catDrink->id, 'name' => 'Es Teh Manis', 'price' => 8000, 'description' => 'Teh melati segar manis dingin', 'is_available' => true],
            ['menu_category_id' => $catDrink->id, 'name' => 'Jus Alpukat', 'price' => 22000, 'description' => 'Jus alpukat kental dengan saus cokelat', 'is_available' => true],
            ['menu_category_id' => $catDessert->id, 'name' => 'Pisang Bakar Keju', 'price' => 18000, 'description' => 'Pisang raja bakar topping susu kental manis dan parutan keju', 'is_available' => true],
        ];
        foreach ($menus as $menu) {
            Menu::firstOrCreate(['name' => $menu['name']], $menu);
        }

        // 5. Pelanggan Awal
        Customer::firstOrCreate(
            ['phone' => '081234567890'],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@example.com',
                'notes' => 'Preferensi meja dekat jendela',
            ]
        );
        Customer::firstOrCreate(
            ['phone' => '089876543210'],
            [
                'name' => 'Siti Rahma',
                'email' => 'siti@example.com',
                'notes' => 'Alergi makanan laut (seafood)',
            ]
        );
    }
}

<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\MenuCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        return [
            'menu_category_id' => MenuCategory::factory(),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(15000, 80000),
            'is_available' => true,
        ];
    }
}

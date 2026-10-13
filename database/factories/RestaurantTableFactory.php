<?php

namespace Database\Factories;

use App\Models\RestaurantTable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RestaurantTable>
 */
class RestaurantTableFactory extends Factory
{
    protected $model = RestaurantTable::class;

    public function definition(): array
    {
        return [
            'code' => 'T'.fake()->unique()->numberBetween(1, 999),
            'capacity' => fake()->randomElement([2, 4, 6, 8]),
            'location' => fake()->randomElement(['Indoor', 'Outdoor', 'VIP']),
            'is_active' => true,
        ];
    }
}

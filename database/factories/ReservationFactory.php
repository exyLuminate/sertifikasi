<?php

namespace Database\Factories;

use App\Enums\ReservationStatus;
use App\Models\Customer;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $start = now()->addDays(2)->setTime(18, 0);
        $end = (clone $start)->addHours(2);

        return [
            'customer_id' => Customer::factory(),
            'restaurant_table_id' => RestaurantTable::factory(),
            'user_id' => User::factory(),
            'code' => 'RSV-'.strtoupper(fake()->unique()->bothify('######')),
            'start_at' => $start,
            'end_at' => $end,
            'guest_count' => fake()->numberBetween(1, 4),
            'status' => ReservationStatus::Dipesan,
            'note' => fake()->optional()->sentence(),
        ];
    }
}

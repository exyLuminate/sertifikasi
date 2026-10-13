<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'reservation_id' => Reservation::factory(),
            'user_id' => User::factory(),
            'order_number' => 'ORD-'.strtoupper(fake()->unique()->bothify('######')),
            'subtotal' => 50000,
            'tax' => 5000,
            'service_charge' => 2500,
            'total' => 57500,
            'status' => OrderStatus::Dibuat,
        ];
    }
}

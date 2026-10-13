<?php

namespace App\Models;

use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'restaurant_table_id', 'user_id', 'code',
        'start_at', 'end_at', 'guest_count', 'status', 'note',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'status' => ReservationStatus::class,
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function restaurantTable()
    {
        return $this->belongsTo(RestaurantTable::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope pencarian reservasi berdasarkan kode atau nama pelanggan (Unit 4).
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn ($q) => $q->where('code', 'like', "%{$term}%")
            ->orWhereHas('customer', fn ($sub) => $sub->where('name', 'like', "%{$term}%"))
        );
    }
}

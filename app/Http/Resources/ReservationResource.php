<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'start_at' => $this->start_at?->format('Y-m-d H:i'),
            'end_at' => $this->end_at?->format('Y-m-d H:i'),
            'guest_count' => $this->guest_count,
            'status' => $this->status->value ?? $this->status,
            'note' => $this->note,
            'customer' => $this->whenLoaded('customer'),
            'restaurant_table' => $this->whenLoaded('restaurantTable'),
            'user' => $this->whenLoaded('user'),
            'orders' => $this->whenLoaded('orders'),
        ];
    }
}

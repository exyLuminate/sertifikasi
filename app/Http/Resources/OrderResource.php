<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'subtotal' => (float) $this->subtotal,
            'tax' => (float) $this->tax,
            'service_charge' => (float) $this->service_charge,
            'total' => (float) $this->total,
            'status' => $this->status->value ?? $this->status,
            'created_at' => $this->created_at?->format('Y-m-d H:i'),
            'reservation' => $this->whenLoaded('reservation'),
            'user' => $this->whenLoaded('user'),
            'items' => $this->whenLoaded('items', function () {
                return $this->items->map(fn ($item) => [
                    'id' => $item->id,
                    'menu_id' => $item->menu_id,
                    'menu_name' => $item->menu?->name,
                    'price_at_order' => (float) $item->price_at_order,
                    'qty' => (int) $item->qty,
                    'subtotal' => (float) $item->subtotal,
                    'note' => $item->note,
                ]);
            }),
        ];
    }
}

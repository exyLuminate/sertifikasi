<?php

namespace App\Http\Requests;

use App\Models\Reservation;
use App\Models\RestaurantTable;
use Illuminate\Foundation\Http\FormRequest;

class UpdateReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'restaurant_table_id' => 'nullable|exists:restaurant_tables,id',
            'start_at' => 'required|date',
            'end_at' => 'required|date|after:start_at',
            'guest_count' => 'required|integer|min:1',
            'status' => 'required|in:dipesan,dikonfirmasi,selesai,dibatalkan',
            'note' => 'nullable|string',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $tableId = $this->input('restaurant_table_id');
            $startAt = $this->input('start_at');
            $endAt = $this->input('end_at');
            $guestCount = $this->input('guest_count');
            $reservationId = $this->route('reservation')->id;

            if ($tableId) {
                // 1. Cek Kapasitas Meja
                $table = RestaurantTable::find($tableId);
                if ($table && $guestCount > $table->capacity) {
                    $validator->errors()->add(
                        'guest_count',
                        "Jumlah tamu ({$guestCount}) melebihi maksimal kapasitas meja ini ({$table->capacity} orang)."
                    );
                }

                // 2. Cek Double Booking (Bentrok Jadwal)
                if ($startAt && $endAt) {
                    $isConflict = Reservation::where('restaurant_table_id', $tableId)
                        ->where('id', '!=', $reservationId) // Abaikan dirinya sendiri saat update
                        ->whereIn('status', ['dipesan', 'dikonfirmasi'])
                        ->where(function ($query) use ($startAt, $endAt) {
                            $query->whereBetween('start_at', [$startAt, $endAt])
                                ->orWhereBetween('end_at', [$startAt, $endAt])
                                ->orWhere(function ($q) use ($startAt, $endAt) {
                                    $q->where('start_at', '<=', $startAt)
                                        ->where('end_at', '>=', $endAt);
                                });
                        })->exists();

                    if ($isConflict) {
                        $validator->errors()->add('restaurant_table_id', 'Meja ini sudah dipesan pada rentang waktu tersebut.');
                    }
                }
            }
        });
    }
}

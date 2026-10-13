<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi pembuatan reservasi meja (Unit 2: Form Request & Unit 4: Thin Controller).
 */
class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'restaurant_table_id' => ['required', 'exists:restaurant_tables,id'],
            'start_at' => ['required', 'date', 'after:now'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Pelanggan wajib dipilih.',
            'customer_id.exists' => 'Pelanggan yang dipilih tidak valid.',
            'restaurant_table_id.required' => 'Meja restoran wajib dipilih.',
            'restaurant_table_id.exists' => 'Meja yang dipilih tidak valid.',
            'start_at.required' => 'Waktu reservasi wajib diisi.',
            'start_at.date' => 'Format waktu reservasi tidak valid.',
            'start_at.after' => 'Waktu reservasi tidak boleh di masa lalu.',
            'guest_count.required' => 'Jumlah tamu wajib diisi.',
            'guest_count.integer' => 'Jumlah tamu harus berupa angka.',
            'guest_count.min' => 'Jumlah tamu minimal 1 orang.',
            'note.max' => 'Catatan maksimal 500 karakter.',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi pembuatan pesanan baru (Unit 2: Form Request & Unit 4: Thin Controller).
 */
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reservation_id' => ['required', 'exists:reservations,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'exists:menus,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.note' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'reservation_id.required' => 'Reservasi wajib dipilih.',
            'reservation_id.exists' => 'Reservasi yang dipilih tidak ditemukan.',
            'items.required' => 'Pesanan harus memiliki minimal 1 menu.',
            'items.array' => 'Format daftar menu tidak valid.',
            'items.min' => 'Pesanan harus memiliki minimal 1 menu.',
            'items.*.menu_id.required' => 'Menu wajib dipilih.',
            'items.*.menu_id.exists' => 'Menu yang dipilih tidak valid.',
            'items.*.qty.required' => 'Kuantitas menu wajib diisi.',
            'items.*.qty.integer' => 'Kuantitas menu harus berupa angka bulat.',
            'items.*.qty.min' => 'Kuantitas menu minimal 1 porsi.',
            'items.*.note.max' => 'Catatan menu maksimal 255 karakter.',
        ];
    }
}

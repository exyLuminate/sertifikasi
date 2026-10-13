<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRestaurantTableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:10', 'unique:restaurant_tables,code'],
            'capacity' => ['required', 'integer', 'min:1'],
            'location' => ['required', 'in:indoor,outdoor,vip'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kode meja wajib diisi.',
            'code.max' => 'Kode meja maksimal 10 karakter.',
            'code.unique' => 'Kode meja sudah digunakan.',
            'capacity.required' => 'Kapasitas meja wajib diisi.',
            'capacity.integer' => 'Kapasitas meja harus berupa angka.',
            'capacity.min' => 'Kapasitas meja minimal 1 orang.',
            'location.required' => 'Lokasi meja wajib dipilih.',
            'location.in' => 'Lokasi meja harus salah satu dari: indoor, outdoor, atau vip.',
        ];
    }
}

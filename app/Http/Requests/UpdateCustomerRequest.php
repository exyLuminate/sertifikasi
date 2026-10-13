<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi saat mengubah data pelanggan.
 *
 * Perbedaan dari StoreCustomerRequest:
 * - Rule unique pada phone mengabaikan baris pelanggan saat ini
 *   agar tidak ditolak saat nomor tidak diubah.
 */
class UpdateCustomerRequest extends FormRequest
{
    /**
     * Semua pengguna yang sudah login boleh mengubah pelanggan.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi untuk mengubah data pelanggan.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('customers', 'phone')->ignore($this->route('customer')),
            ],
            'email' => ['nullable', 'email', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Pesan error dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelanggan wajib diisi.',
            'name.max' => 'Nama tidak boleh lebih dari 100 karakter.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.unique' => 'Nomor telepon sudah terdaftar untuk pelanggan lain.',
            'phone.max' => 'Nomor telepon tidak boleh lebih dari 20 karakter.',
            'email.email' => 'Format email tidak valid.',
            'notes.max' => 'Catatan tidak boleh lebih dari 500 karakter.',
        ];
    }
}

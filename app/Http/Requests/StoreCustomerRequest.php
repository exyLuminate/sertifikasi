<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi saat membuat pelanggan baru.
 *
 * Aturan bisnis yang ditegakkan di sini:
 * - Nama wajib diisi, maksimal 100 karakter.
 * - Nomor telepon wajib, unik di tabel customers, dan hanya boleh angka/+/-.
 * - Email opsional tapi harus format email jika diisi.
 * - Catatan opsional, maksimal 500 karakter.
 */
class StoreCustomerRequest extends FormRequest
{
    /**
     * Semua pengguna yang sudah login boleh membuat pelanggan (staf dan admin).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Aturan validasi untuk membuat pelanggan baru.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20', 'unique:customers,phone'],
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

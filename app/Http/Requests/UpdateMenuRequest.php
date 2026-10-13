<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'menu_category_id' => ['required', 'exists:menu_categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'gt:0'],
            'is_available' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'menu_category_id.required' => 'Kategori menu wajib dipilih.',
            'menu_category_id.exists' => 'Kategori menu yang dipilih tidak valid.',
            'name.required' => 'Nama menu wajib diisi.',
            'name.max' => 'Nama menu maksimal 150 karakter.',
            'price.required' => 'Harga menu wajib diisi.',
            'price.numeric' => 'Harga menu harus berupa angka.',
            'price.gt' => 'Harga menu harus lebih besar dari 0.',
        ];
    }
}

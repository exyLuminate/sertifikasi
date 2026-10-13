<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('menu_categories', 'name')
                    ->ignore($this->route('menuCategory'))
                    ->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori menu wajib diisi.',
            'name.max' => 'Nama kategori menu maksimal 100 karakter.',
            'name.unique' => 'Nama kategori menu sudah digunakan.',
        ];
    }
}

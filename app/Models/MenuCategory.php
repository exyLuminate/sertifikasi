<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MenuCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name'];

    public function menus(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    /**
     * Scope pencarian kategori menu berdasarkan nama (Unit 4: OOP & query scope).
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn ($q) => $q->where('name', 'like', "%{$term}%")
        );
    }
}

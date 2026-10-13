<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Model pengguna sistem (admin dan staf).
 *
 * Mendukung soft delete sehingga akun hanya dinonaktifkan,
 * bukan dihapus permanen dari database.
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Atribut yang boleh diisi secara massal.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    /**
     * Atribut yang disembunyikan saat serialisasi.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Cast atribut ke tipe yang sesuai.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,       // <-- Ini yang mengubah string menjadi objek Enum
            'is_active' => 'boolean',    // <-- Sekalian cast ke boolean
            'last_login_at' => 'datetime', // <-- Sekalian cast ke datetime
        ];
    }

    /**
     * Cek apakah pengguna adalah admin.
     */
    public function isAdmin(): bool
    {
        // Karena role sudah di-cast jadi objek Enum, kita harus bandingkan dengan Enum juga
        return $this->role === Role::Admin;
    }

    /**
     * Cek apakah pengguna adalah staf.
     */
    public function isStaf(): bool
    {
        return $this->role === Role::Staf;
    }

    /**
     * Scope pencarian pengguna berdasarkan nama atau email (Unit 4: OOP & query scope).
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $query->when($term, fn ($q) => $q->where('name', 'like', "%{$term}%")
            ->orWhere('email', 'like', "%{$term}%")
        );
    }
}

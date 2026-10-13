<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

/**
 * Middleware Inertia: mengoper shared props ke seluruh halaman React.
 *
 * Props yang dibagikan ke semua halaman:
 * - auth.user  : data pengguna yang sedang login (termasuk role)
 * - flash      : pesan sukses/error satu kali (flash message)
 *
 * Dengan shared props ini, komponen React tidak perlu memanggil
 * API terpisah untuk mengetahui siapa yang login atau menampilkan notifikasi.
 */
class HandleInertiaRequests extends Middleware
{
    /**
     * Template Blade root yang dimuat pada kunjungan halaman pertama.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Tentukan versi aset saat ini (untuk cache-busting Inertia).
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Definisikan props yang dibagikan ke semua halaman React secara default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            // Data pengguna yang sedang login, beserta role-nya.
            // Diakses di React via usePage().props.auth.user
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ] : null,
            ],

            // Flash message: muncul sekali setelah redirect.
            // Diakses di React via usePage().props.flash
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}

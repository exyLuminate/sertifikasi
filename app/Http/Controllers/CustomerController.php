<?php

namespace App\Http\Controllers;

use App\Enums\ReservationStatus;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CustomerController — mengelola data pelanggan.
 *
 * Mengikuti prinsip controller tipis (Unit 2 & 4):
 * validasi dilimpahkan ke Form Request, logika pencarian di query scope model.
 * Controller hanya mengurus alur request → data → response.
 */
class CustomerController extends Controller
{
    /**
     * Tampilkan daftar pelanggan dengan pencarian nama atau telepon.
     */
    public function index(Request $request): Response
    {
        $customers = Customer::search($request->search)
            ->withCount('reservations')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => CustomerResource::collection($customers),
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Tampilkan form tambah pelanggan baru.
     */
    public function create(): Response
    {
        return Inertia::render('Customers/Create');
    }

    /**
     * Simpan pelanggan baru ke database.
     */
    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::create($request->validated());

        return redirect()
            ->route('customers.index')
            ->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    /**
     * Tampilkan detail pelanggan beserta riwayat reservasinya.
     */
    public function show(Customer $customer): Response
    {
        $customer->load([
            'reservations' => fn ($q) => $q->with('restaurantTable', 'orders')
                ->latest('start_at')
                ->limit(20),
        ]);

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Tampilkan form edit data pelanggan.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Simpan perubahan data pelanggan.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return redirect()
            ->route('customers.show', $customer)
            ->with('success', 'Data pelanggan berhasil diperbarui.');
    }

    /**
     * Soft delete pelanggan.
     *
     * Pelanggan tidak dapat dihapus jika masih memiliki reservasi aktif.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        // Guard clause: cek reservasi aktif sebelum menghapus (Unit 3: percabangan & Unit 4: Enum)
        $hasActiveReservation = $customer->reservations()
            ->whereIn('status', [ReservationStatus::Dipesan, ReservationStatus::Dikonfirmasi])
            ->exists();

        if ($hasActiveReservation) {
            return redirect()
                ->back()
                ->with('error', 'Pelanggan tidak dapat dihapus karena masih memiliki reservasi aktif.');
        }

        $customer->delete();

        return redirect()
            ->route('customers.index')
            ->with('success', 'Pelanggan berhasil dihapus.');
    }
}

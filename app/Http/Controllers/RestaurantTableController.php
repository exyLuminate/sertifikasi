<?php

namespace App\Http\Controllers;

use App\Enums\ReservationStatus;
use App\Http\Requests\StoreRestaurantTableRequest;
use App\Http\Requests\UpdateRestaurantTableRequest;
use App\Http\Resources\RestaurantTableResource;
use App\Models\RestaurantTable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RestaurantTableController extends Controller
{
    public function index(Request $request)
    {
        $tables = RestaurantTable::search($request->search)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Tables/Index', [
            'tables' => RestaurantTableResource::collection($tables),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Tables/Create');
    }

    public function store(StoreRestaurantTableRequest $request)
    {
        RestaurantTable::create($request->validated());

        return redirect()->route('tables.index')->with('success', 'Meja berhasil ditambahkan.');
    }

    public function edit(RestaurantTable $restaurantTable) // Parameter harus sesuai dengan nama route resource
    {
        return Inertia::render('Admin/Tables/Edit', [
            'table' => new RestaurantTableResource($restaurantTable),
        ]);
    }

    public function update(UpdateRestaurantTableRequest $request, RestaurantTable $restaurantTable)
    {
        $restaurantTable->update($request->validated());

        return redirect()->route('tables.index')->with('success', 'Meja berhasil diperbarui.');
    }

    public function destroy(RestaurantTable $restaurantTable)
    {
        // Validasi Unit 6: Meja tidak bisa dihapus jika ada reservasi mendatang
        $hasUpcomingReservations = $restaurantTable->reservations()
            ->where('start_at', '>=', now())
            ->whereIn('status', [ReservationStatus::Dipesan, ReservationStatus::Dikonfirmasi])
            ->exists();

        if ($hasUpcomingReservations) {
            return back()->with('error', 'Meja tidak dapat dihapus karena memiliki reservasi mendatang. Silakan nonaktifkan saja.');
        }

        $restaurantTable->delete();

        return back()->with('success', 'Meja berhasil dihapus.');
    }
}

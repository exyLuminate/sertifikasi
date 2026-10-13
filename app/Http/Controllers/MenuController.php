<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuRequest;
use App\Http\Requests\UpdateMenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $menus = Menu::with('category') // Mencegah N+1 query
            ->search($request->search)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Menus/Index', [
            'menus' => MenuResource::collection($menus),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        // Kirim data kategori untuk dropdown form menu baru
        return Inertia::render('Admin/Menus/Create', [
            'categories' => MenuCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreMenuRequest $request)
    {
        Menu::create($request->validated());

        return redirect()->route('menus.index')
            ->with('success', 'Menu berhasil ditambahkan.');
    }

    public function edit(Menu $menu)
    {
        return Inertia::render('Admin/Menus/Edit', [
            'menu' => new MenuResource($menu->load('category')),
            // Kirim data kategori untuk dropdown edit menu
            'categories' => MenuCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateMenuRequest $request, Menu $menu)
    {
        $menu->update($request->validated());

        return redirect()->route('menus.index')
            ->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu)
    {
        // Opsional: jika Anda sudah membuat model OrderItem, bisa tambahkan guard clause di sini
        // if ($menu->orderItems()->exists()) { return back()->with('error', 'Tidak bisa hapus menu...'); }

        $menu->delete();

        return back()->with('success', 'Menu berhasil dihapus.');
    }
}

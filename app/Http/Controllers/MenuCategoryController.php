<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMenuCategoryRequest;
use App\Http\Requests\UpdateMenuCategoryRequest;
use App\Http\Resources\MenuCategoryResource;
use App\Models\MenuCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuCategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = MenuCategory::search($request->search)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/MenuCategories/Index', [
            'categories' => MenuCategoryResource::collection($categories),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/MenuCategories/Create');
    }

    public function store(StoreMenuCategoryRequest $request)
    {
        MenuCategory::create($request->validated());

        return redirect()->route('menu-categories.index')
            ->with('success', 'Kategori Menu berhasil ditambahkan.');
    }

    public function edit(MenuCategory $menuCategory)
    {
        return Inertia::render('Admin/MenuCategories/Edit', [
            'category' => new MenuCategoryResource($menuCategory),
        ]);
    }

    public function update(UpdateMenuCategoryRequest $request, MenuCategory $menuCategory)
    {
        $menuCategory->update($request->validated());

        return redirect()->route('menu-categories.index')
            ->with('success', 'Kategori Menu berhasil diperbarui.');
    }

    public function destroy(MenuCategory $menuCategory)
    {
        // Guard clause: Mencegah penghapusan kategori jika ada menu di dalamnya
        if ($menuCategory->menus()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki menu.');
        }

        $menuCategory->delete();

        return back()->with('success', 'Kategori Menu berhasil dihapus.');
    }
}

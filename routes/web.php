<?php

use App\Enums\Role;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MenuCategoryController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RestaurantTableController;
use App\Http\Controllers\UserController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Pelanggan: diakses staf dan admin
    Route::resource('customers', CustomerController::class);

    // Reservasi: diakses staf dan admin
    Route::post('reservations/{reservation}/confirm', [ReservationController::class, 'confirm'])->name('reservations.confirm');
    Route::post('reservations/{reservation}/complete', [ReservationController::class, 'complete'])->name('reservations.complete');
    Route::post('reservations/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('reservations.cancel');
    Route::get('reservations/{reservation}/pdf', [ReservationController::class, 'exportPdf'])->name('reservations.pdf');
    Route::resource('reservations', ReservationController::class)->except(['edit', 'update']);

    // Pesanan: diakses staf dan admin
    Route::post('orders/{order}/complete', [OrderController::class, 'complete'])->name('orders.complete');
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::resource('orders', OrderController::class)->except(['edit', 'update', 'destroy']);
});

Route::middleware(['auth', 'verified', 'role:'.Role::Admin->value])->group(function () {
    Route::resource('tables', RestaurantTableController::class)->parameters([
        'tables' => 'restaurantTable',
    ]);
    Route::resource('menu-categories', MenuCategoryController::class)->parameters([
        'menu-categories' => 'menuCategory',
    ]);
    Route::resource('menus', MenuController::class);
    Route::resource('users', UserController::class);

    // Laporan dan ekspor PDF
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__.'/auth.php';

<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * DashboardController — Mengelola data dashboard adaptif sesuai role pengguna (Unit 5 & 6).
 */
class DashboardController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Tampilkan dashboard dengan data khusus untuk admin atau staf.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === Role::Admin || $user->role === Role::Admin->value;

        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $last7DaysStart = now()->subDays(6)->startOfDay();

        $activeTables = $this->reportService->currentActiveTables();

        if ($isAdmin) {
            $summary = $this->reportService->reservationSummary($todayStart, $todayEnd);
            $revenue = $this->reportService->revenue($todayStart, $todayEnd);
            $dailyReservations = $this->reportService->dailyReservations($last7DaysStart, $todayEnd);
            $topMenus = $this->reportService->topMenus($last7DaysStart, $todayEnd, 5);

            $totalTablesCount = RestaurantTable::where('is_active', true)->count();

            return Inertia::render('Dashboard', [
                'role' => 'admin',
                'summary' => $summary,
                'revenue' => $revenue,
                'dailyReservations' => $dailyReservations,
                'activeTables' => $activeTables,
                'totalTablesCount' => $totalTablesCount,
                'topMenus' => $topMenus,
            ]);
        }

        // Tampilan untuk Staf: fokus operasional hari ini dan pesanan berjalan
        $todayReservations = Reservation::query()
            ->with(['customer', 'restaurantTable'])
            ->whereBetween('start_at', [$todayStart, $todayEnd])
            ->orderBy('start_at')
            ->get();

        $runningOrders = Order::query()
            ->with(['reservation.customer', 'reservation.restaurantTable', 'items.menu'])
            ->where('status', OrderStatus::Dibuat)
            ->latest()
            ->get();

        return Inertia::render('Dashboard', [
            'role' => 'staf',
            'todayReservations' => $todayReservations,
            'runningOrders' => $runningOrders,
            'activeTables' => $activeTables,
        ]);
    }
}

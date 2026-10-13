<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * ReportService — Mengelola query agregat untuk laporan, analitik, dan dashboard (Unit 5 & 6).
 *
 * Menerapkan:
 * - Query agregat di database (COUNT, SUM, GROUP BY), bukan looping manual di PHP.
 * - Penyaringan pendapatan ketat hanya dari pesanan yang berstatus selesai.
 * - Pembentukan data grafik 7 hari dengan pengisian hari kosong bernilai 0.
 */
class ReportService
{
    /**
     * Ringkasan jumlah reservasi dan total tamu per status dalam rentang tanggal.
     *
     * @return array<string, array{count: int, guests: int}>
     */
    public function reservationSummary(CarbonInterface $from, CarbonInterface $to): array
    {
        $raw = Reservation::query()
            ->whereBetween('start_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->selectRaw('status, COUNT(*) as total_reservations, COALESCE(SUM(guest_count), 0) as total_guests')
            ->groupBy('status')
            ->get()
            ->keyBy(fn ($item) => $item->status instanceof ReservationStatus ? $item->status->value : (string) $item->status);

        $summary = [];
        foreach (ReservationStatus::cases() as $status) {
            $key = $status->value;
            $row = $raw->get($key);
            $summary[$key] = [
                'count' => $row ? (int) $row->total_reservations : 0,
                'guests' => $row ? (int) $row->total_guests : 0,
            ];
        }

        return $summary;
    }

    /**
     * Jumlah reservasi per meja restoran dalam rentang tanggal.
     */
    public function reservationsPerTable(CarbonInterface $from, CarbonInterface $to): Collection
    {
        return RestaurantTable::query()
            ->leftJoin('reservations', function ($join) use ($from, $to) {
                $join->on('restaurant_tables.id', '=', 'reservations.restaurant_table_id')
                    ->whereBetween('reservations.start_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()]);
            })
            ->selectRaw('restaurant_tables.id, restaurant_tables.code, restaurant_tables.capacity, restaurant_tables.location, COUNT(reservations.id) as total_reservations, COALESCE(SUM(reservations.guest_count), 0) as total_guests')
            ->groupBy('restaurant_tables.id', 'restaurant_tables.code', 'restaurant_tables.capacity', 'restaurant_tables.location')
            ->orderByDesc('total_reservations')
            ->orderBy('restaurant_tables.code')
            ->get();
    }

    /**
     * Jumlah reservasi harian untuk grafik Chart.js.
     * Mengisi hari tanpa reservasi dengan angka 0 secara deterministik.
     *
     * @return array{labels: array<int, string>, values: array<int, int>}
     */
    public function dailyReservations(CarbonInterface $from, CarbonInterface $to): array
    {
        // Query agregat per tanggal
        $raw = Reservation::query()
            ->whereBetween('start_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->selectRaw('DATE(start_at) as reservation_date, COUNT(*) as total_reservations')
            ->groupByRaw('DATE(start_at)')
            ->pluck('total_reservations', 'reservation_date')
            ->all();

        $labels = [];
        $values = [];

        $current = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();

        while ($current->lte($end)) {
            $dateKey = $current->format('Y-m-d');
            $labels[] = $current->isoFormat('D MMM') ?: $current->format('d M');
            $values[] = isset($raw[$dateKey]) ? (int) $raw[$dateKey] : 0;
            $current->addDay();
        }

        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }

    /**
     * Daftar menu terlaris berdasarkan total kuantitas dari pesanan selesai (Hal. 59).
     */
    public function topMenus(CarbonInterface $from, CarbonInterface $to, int $limit = 5): Collection
    {
        return OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('menus', 'menus.id', '=', 'order_items.menu_id')
            ->where('orders.status', OrderStatus::Selesai)
            ->whereBetween('orders.created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->selectRaw('menus.id, menus.name, SUM(order_items.qty) as total_qty, SUM(order_items.subtotal) as total_sales')
            ->groupBy('menus.id', 'menus.name')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get();
    }

    /**
     * Total pendapatan restoran dari pesanan berstatus Selesai (Hal. 59).
     */
    public function revenue(CarbonInterface $from, CarbonInterface $to): float
    {
        return (float) Order::query()
            ->where('status', OrderStatus::Selesai)
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->sum('total');
    }

    /**
     * Kinerja staf: jumlah reservasi dan pesanan yang ditangani masing-masing staf.
     */
    public function staffPerformance(CarbonInterface $from, CarbonInterface $to): Collection
    {
        return User::query()
            ->leftJoin('reservations', function ($join) use ($from, $to) {
                $join->on('users.id', '=', 'reservations.user_id')
                    ->whereBetween('reservations.start_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()]);
            })
            ->leftJoin('orders', function ($join) use ($from, $to) {
                $join->on('users.id', '=', 'orders.user_id')
                    ->whereBetween('orders.created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()]);
            })
            ->selectRaw('users.id, users.name, users.role, COUNT(DISTINCT reservations.id) as total_reservations, COUNT(DISTINCT orders.id) as total_orders')
            ->groupBy('users.id', 'users.name', 'users.role')
            ->orderByDesc('total_reservations')
            ->get();
    }

    /**
     * Daftar meja yang saat ini sedang terpakai (reservasi terkonfirmasi yang sedang berjalan sekarang).
     */
    public function currentActiveTables(): Collection
    {
        $now = now();

        return Reservation::query()
            ->with(['restaurantTable', 'customer'])
            ->where('status', ReservationStatus::Dikonfirmasi)
            ->where('start_at', '<=', $now)
            ->where('end_at', '>=', $now)
            ->get();
    }
}

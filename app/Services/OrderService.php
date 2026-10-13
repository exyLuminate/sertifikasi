<?php

namespace App\Services;

use App\Contracts\SurchargeInterface;
use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * OrderService — Mengelola logika bisnis dan kalkulasi pesanan makanan/minuman.
 *
 * Menerapkan:
 * - Unit 3: Logika murni perhitungan subtotal, surcharges, total, dan penggabungan menu kembar.
 * - Unit 4: Polymorphism melalui SurchargeInterface dan enum OrderStatus state machine.
 * - Unit 6: Transaksi DB, Concurrency Control (lockForUpdate), dan audit harga historis.
 */
class OrderService
{
    /**
     * @param  array<string, SurchargeInterface>  $surcharges  Daftar biaya tambahan terindeks kunci ('tax', 'service_charge')
     */
    public function __construct(
        private array $surcharges = []
    ) {}

    /**
     * Hitung subtotal pesanan secara murni dari array baris item (Unit 3).
     *
     * @param  array<int, array{price: float|int, qty: int}>  $lines
     */
    public function calculateSubtotal(array $lines): float
    {
        $subtotal = 0.0;

        foreach ($lines as $line) {
            $price = (float) $line['price'];
            $qty = (int) $line['qty'];
            $subtotal += round($price * $qty, 2);
        }

        return round($subtotal, 2);
    }

    /**
     * Hitung rincian biaya tambahan (pajak & layanan) secara murni dari subtotal (Unit 3 & 4).
     *
     * @return array<string, float> Peta hasil perhitungan biaya tambahan
     */
    public function calculateSurcharges(float $subtotal): array
    {
        $results = [];

        foreach ($this->surcharges as $key => $surcharge) {
            $results[$key] = $surcharge->calculate($subtotal);
        }

        return $results;
    }

    /**
     * Hitung total keseluruhan pesanan (subtotal + akumulasi biaya tambahan) (Unit 3).
     */
    public function calculateTotal(float $subtotal): float
    {
        $total = $subtotal;
        $surcharges = $this->calculateSurcharges($subtotal);

        foreach ($surcharges as $amount) {
            $total += $amount;
        }

        return round($total, 2);
    }

    /**
     * Gabungkan item menu yang sama (menu kembar) agar qty dijumlahkan (Unit 3).
     *
     * @param  array<int, array{menu_id: int, qty: int, note?: string|null}>  $items
     * @return array<int, array{menu_id: int, qty: int, note: string|null}>
     */
    public function mergeItems(array $items): array
    {
        $merged = [];

        foreach ($items as $item) {
            $menuId = (int) $item['menu_id'];
            $qty = (int) $item['qty'];
            $note = isset($item['note']) && trim((string) $item['note']) !== '' ? trim((string) $item['note']) : null;

            if (! isset($merged[$menuId])) {
                $merged[$menuId] = [
                    'menu_id' => $menuId,
                    'qty' => $qty,
                    'note' => $note,
                ];
            } else {
                $merged[$menuId]['qty'] += $qty;

                // Gabungkan catatan jika keduanya ada
                if ($note !== null) {
                    $existingNote = $merged[$menuId]['note'];
                    $merged[$menuId]['note'] = $existingNote ? "{$existingNote}; {$note}" : $note;
                }
            }
        }

        return $merged;
    }

    /**
     * Buat nomor pesanan unik format ORD-YYYYMMDD-NNNN di dalam transaksi (Unit 6).
     */
    public function generateOrderNumber(): string
    {
        $dateStr = now()->format('Ymd');
        $countToday = Order::whereDate('created_at', now()->toDateString())->count() + 1;

        return sprintf('ORD-%s-%04d', $dateStr, $countToday);
    }

    /**
     * Buat pesanan baru lengkap dengan itemnya di dalam satu DB Transaction (Unit 6).
     *
     * @throws InvalidArgumentException
     */
    public function create(array $data, int $userId): Order
    {
        return DB::transaction(function () use ($data, $userId) {
            // Kunci baris reservasi untuk memastikan status tidak berubah bersamaan
            $reservation = Reservation::lockForUpdate()->findOrFail($data['reservation_id']);

            // Pesanan HANYA boleh dibuat untuk reservasi yang berstatus dikonfirmasi
            if ($reservation->status !== ReservationStatus::Dikonfirmasi) {
                throw new InvalidArgumentException('Pesanan hanya dapat dibuat untuk reservasi yang telah dikonfirmasi.');
            }

            // Gabungkan menu kembar jika ada
            $mergedItems = $this->mergeItems($data['items'] ?? []);

            if (empty($mergedItems)) {
                throw new InvalidArgumentException('Pesanan wajib memiliki minimal 1 menu.');
            }

            $menuIds = array_keys($mergedItems);
            $menus = Menu::whereIn('id', $menuIds)->get()->keyBy('id');

            $lines = [];
            foreach ($mergedItems as $menuId => $itemData) {
                $menu = $menus->get($menuId);

                if (! $menu) {
                    throw new InvalidArgumentException("Menu dengan ID #{$menuId} tidak ditemukan.");
                }

                if (! $menu->is_available) {
                    throw new InvalidArgumentException("Menu {$menu->name} sedang tidak tersedia.");
                }

                // Ambil harga dari database (server as source of truth)
                $lines[] = [
                    'menu' => $menu,
                    'price' => (float) $menu->price,
                    'qty' => (int) $itemData['qty'],
                    'note' => $itemData['note'] ?? null,
                ];
            }

            // Hitung finansial secara aman di server
            $subtotal = $this->calculateSubtotal($lines);
            $surcharges = $this->calculateSurcharges($subtotal);
            $total = $this->calculateTotal($subtotal);

            $order = Order::create([
                'reservation_id' => $reservation->id,
                'user_id' => $userId,
                'order_number' => $this->generateOrderNumber(),
                'subtotal' => $subtotal,
                'tax' => $surcharges['tax'] ?? 0.0,
                'service_charge' => $surcharges['service_charge'] ?? 0.0,
                'total' => $total,
                'status' => OrderStatus::Dibuat,
            ]);

            foreach ($lines as $line) {
                $order->items()->create([
                    'menu_id' => $line['menu']->id,
                    'price_at_order' => $line['price'],
                    'qty' => $line['qty'],
                    'subtotal' => round($line['price'] * $line['qty'], 2),
                    'note' => $line['note'],
                ]);
            }

            return $order;
        });
    }

    /**
     * Selesaikan pesanan (Dibuat -> Selesai).
     *
     * @throws InvalidArgumentException
     */
    public function complete(Order $order): void
    {
        if ($order->status !== OrderStatus::Dibuat) {
            throw new InvalidArgumentException("Pesanan dengan status '{$order->status->value}' tidak dapat diselesaikan.");
        }

        $order->update(['status' => OrderStatus::Selesai]);
    }

    /**
     * Batalkan pesanan (Dibuat -> Dibatalkan).
     *
     * @throws InvalidArgumentException
     */
    public function cancel(Order $order): void
    {
        if ($order->status !== OrderStatus::Dibuat) {
            throw new InvalidArgumentException("Pesanan dengan status '{$order->status->value}' tidak dapat dibatalkan.");
        }

        $order->update(['status' => OrderStatus::Dibatalkan]);
    }
}

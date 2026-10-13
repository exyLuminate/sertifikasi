<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Exceptions\TableUnavailableException;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * ReservationService — Mengelola logika bisnis reservasi meja restoran.
 *
 * Menerapkan:
 * - Unit 3: Pemrograman Terstruktur (method murni, percabangan, perulangan, guard clauses)
 * - Unit 4: Pemrograman Berorientasi Objek (encapsulation, custom exception, enum state machine)
 * - Unit 6: Akses Basis Data (DB Transaction, lockForUpdate, query bentrok jadwal)
 */
class ReservationService
{
    /**
     * Hitung waktu selesai reservasi berdasarkan durasi default (menit).
     */
    public function calculateEndTime(CarbonInterface $start): CarbonInterface
    {
        $duration = (int) config('restaurant.default_duration', 120);

        return $start->copy()->addMinutes($duration);
    }

    /**
     * Periksa apakah waktu mulai dan selesai berada dalam jam operasional restoran.
     * Jam selesai tidak boleh melewati jam tutup.
     */
    public function isWithinOperatingHours(CarbonInterface $start, CarbonInterface $end): bool
    {
        $openTime = config('restaurant.open', '10:00');
        $closeTime = config('restaurant.close', '22:00');

        $open = $start->copy()->setTimeFromTimeString($openTime);
        $close = $start->copy()->setTimeFromTimeString($closeTime);

        return $start >= $open && $end <= $close;
    }

    /**
     * Periksa apakah dua rentang waktu saling tumpang tindih (bentrok).
     * Dua rentang bentrok jika masing-masing mulai sebelum yang lain selesai.
     * Catatan: Jadwal berurutan (selesai tepat saat yang lain mulai) TIDAK bentrok.
     */
    public function isOverlapping(
        CarbonInterface $startA,
        CarbonInterface $endA,
        CarbonInterface $startB,
        CarbonInterface $endB
    ): bool {
        return $startA < $endB && $endA > $startB;
    }

    /**
     * Validasi jumlah tamu terhadap kapasitas meja.
     *
     * @throws InvalidArgumentException Jika tamu kurang dari 1 atau melebihi kapasitas
     */
    public function validateGuestCount(int $capacity, int $guestCount): void
    {
        if ($guestCount < 1) {
            throw new InvalidArgumentException('Jumlah tamu minimal 1 orang.');
        }

        if ($guestCount > $capacity) {
            throw new InvalidArgumentException("Jumlah tamu ($guestCount) melebihi kapasitas meja ($capacity orang).");
        }
    }

    /**
     * Saring meja yang tersedia secara murni dari koleksi memori (Unit 3).
     */
    public function filterAvailableTables(iterable $tables, int $guestCount, array $bookedIds): array
    {
        $available = [];

        foreach ($tables as $table) {
            if (! $table->is_active) {
                continue;
            }

            if ($table->capacity < $guestCount || in_array($table->id, $bookedIds, true)) {
                continue;
            }

            $available[] = $table;
        }

        return $available;
    }

    /**
     * Periksa apakah meja tertentu mengalami bentrok jadwal pada database (Unit 6).
     * Reservasi berstatus dibatalkan atau selesai tidak dihitung bentrok.
     */
    public function hasConflict(
        int $tableId,
        CarbonInterface $start,
        CarbonInterface $end,
        ?int $ignoreId = null
    ): bool {
        return Reservation::query()
            ->where('restaurant_table_id', $tableId)
            ->whereIn('status', [ReservationStatus::Dipesan, ReservationStatus::Dikonfirmasi])
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists();
    }

    /**
     * Ambil daftar meja yang tersedia (aktif, kapasitas cukup, tidak bentrok jadwal).
     */
    public function availableTables(CarbonInterface $start, CarbonInterface $end, int $guestCount): Collection
    {
        $conflictedTableIds = Reservation::query()
            ->whereIn('status', [ReservationStatus::Dipesan, ReservationStatus::Dikonfirmasi])
            ->where('start_at', '<', $end)
            ->where('end_at', '>', $start)
            ->pluck('restaurant_table_id')
            ->all();

        return RestaurantTable::query()
            ->where('is_active', true)
            ->where('capacity', '>=', $guestCount)
            ->whereNotIn('id', $conflictedTableIds)
            ->orderBy('capacity', 'asc')
            ->orderBy('code', 'asc')
            ->get();
    }

    /**
     * Buat kode reservasi unik format RSV-YYYYMMDD-NNNN di dalam transaksi.
     */
    public function generateCode(): string
    {
        $dateStr = now()->format('Ymd');
        $countToday = Reservation::whereDate('created_at', now()->toDateString())->count() + 1;

        return sprintf('RSV-%s-%04d', $dateStr, $countToday);
    }

    /**
     * Buat reservasi baru dengan penguncian baris meja dan verifikasi ganda bentrok jadwal (Unit 6).
     *
     * @throws InvalidArgumentException
     * @throws TableUnavailableException
     */
    public function create(array $data, int $userId): Reservation
    {
        return DB::transaction(function () use ($data, $userId) {
            // Kunci baris meja agar dua staf tidak memesan meja yang sama bersamaan (Unit 6: Concurrency Control)
            $table = RestaurantTable::lockForUpdate()->findOrFail($data['restaurant_table_id']);

            $start = Carbon::parse($data['start_at']);
            $end = $this->calculateEndTime($start);
            $guestCount = (int) $data['guest_count'];

            // 1. Validasi kapasitas
            $this->validateGuestCount($table->capacity, $guestCount);

            // 2. Validasi jam operasional
            if (! $this->isWithinOperatingHours($start, $end)) {
                throw new InvalidArgumentException('Jadwal reservasi harus berada di dalam jam operasional restoran (10:00 - 22:00).');
            }

            // 3. Validasi tidak boleh di masa lalu
            if ($start->isPast()) {
                throw new InvalidArgumentException('Waktu reservasi tidak boleh di masa lalu.');
            }

            // 4. Verifikasi bentrok jadwal
            if ($this->hasConflict($table->id, $start, $end)) {
                throw new TableUnavailableException("Meja {$table->code} sudah dipesan pada rentang waktu tersebut.");
            }

            return Reservation::create([
                'customer_id' => $data['customer_id'],
                'restaurant_table_id' => $table->id,
                'user_id' => $userId,
                'code' => $this->generateCode(),
                'start_at' => $start,
                'end_at' => $end,
                'guest_count' => $guestCount,
                'status' => ReservationStatus::Dipesan,
                'note' => $data['note'] ?? null,
            ]);
        });
    }

    /**
     * Ubah status reservasi dengan memvalidasi alur transisi yang diizinkan (Unit 4: Enum State Machine).
     *
     * @throws InvalidStatusTransitionException
     */
    public function changeStatus(Reservation $reservation, ReservationStatus $newStatus): void
    {
        if (! $reservation->status->canTransitionTo($newStatus)) {
            throw new InvalidStatusTransitionException(
                "Tidak dapat mengubah status reservasi dari '{$reservation->status->value}' ke '{$newStatus->value}'."
            );
        }

        $reservation->update(['status' => $newStatus]);
    }

    /**
     * Konfirmasi reservasi (Dipesan -> Dikonfirmasi).
     */
    public function confirm(Reservation $reservation): void
    {
        $this->changeStatus($reservation, ReservationStatus::Dikonfirmasi);
    }

    /**
     * Selesaikan reservasi (Dikonfirmasi -> Selesai).
     * Menolak jika masih memiliki pesanan aktif yang belum diselesaikan (Unit 3 & 6).
     *
     * @throws InvalidArgumentException
     */
    public function complete(Reservation $reservation): void
    {
        if ($reservation->orders()->where('status', OrderStatus::Dibuat)->exists()) {
            throw new InvalidArgumentException('Tidak dapat menyelesaikan reservasi karena masih memiliki pesanan yang belum selesai.');
        }

        $this->changeStatus($reservation, ReservationStatus::Selesai);
    }

    /**
     * Batalkan reservasi dan ikut membatalkan pesanan yang belum selesai dalam satu DB Transaction (Unit 6).
     */
    public function cancel(Reservation $reservation): void
    {
        DB::transaction(function () use ($reservation) {
            $this->changeStatus($reservation, ReservationStatus::Dibatalkan);

            // Batalkan pesanan aktif yang belum selesai
            $reservation->orders()
                ->where('status', OrderStatus::Dibuat)
                ->update(['status' => OrderStatus::Dibatalkan]);
        });
    }
}

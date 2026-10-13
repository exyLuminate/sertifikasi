<?php

namespace App\Http\Controllers;

use App\Enums\ReservationStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Exceptions\TableUnavailableException;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Customer;
use App\Models\Reservation;
use App\Models\RestaurantTable;
use App\Services\ReservationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * ReservationController — Controller tipis untuk reservasi meja (Unit 2 & 4).
 * Semua aturan bisnis didelegasikan ke ReservationService.
 */
class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $service
    ) {}

    /**
     * Tampilkan daftar reservasi dengan filter dan pagination (Unit 6).
     */
    public function index(Request $request): Response
    {
        $reservations = Reservation::query()
            ->with(['customer', 'restaurantTable', 'user'])
            ->search($request->search)
            ->when($request->date, fn ($q, $date) => $q->whereDate('start_at', $date))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->table_id, fn ($q, $tableId) => $q->where('restaurant_table_id', $tableId))
            ->latest('start_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Reservations/Index', [
            'reservations' => ReservationResource::collection($reservations),
            'tables' => RestaurantTable::orderBy('code')->get(['id', 'code']),
            'statuses' => array_map(fn ($s) => $s->value, ReservationStatus::cases()),
            'filters' => $request->only(['search', 'date', 'status', 'table_id']),
        ]);
    }

    /**
     * Tampilkan form pembuatan reservasi baru dengan fitur live cek ketersediaan meja (Unit 3).
     */
    public function create(Request $request): Response
    {
        $availableTables = null;
        $checkError = null;
        $maxCapacity = (int) (RestaurantTable::where('is_active', true)->max('capacity') ?? 0);

        // Jika staf memasukkan waktu dan jumlah tamu, hitung meja yang tersedia secara dinamis
        if ($request->filled(['start_at', 'guest_count'])) {
            try {
                $start = Carbon::parse($request->start_at);
                $end = $this->service->calculateEndTime($start);
                $guestCount = (int) $request->guest_count;

                if ($guestCount < 1) {
                    $checkError = 'Jumlah tamu minimal 1 orang.';
                } elseif ($guestCount > $maxCapacity) {
                    $checkError = "Jumlah tamu ($guestCount orang) melebihi kapasitas meja terbesar di restoran (maksimal $maxCapacity orang per meja).";
                } elseif ($start->isPast()) {
                    $checkError = 'Waktu kedatangan tidak boleh di masa lalu.';
                } elseif (! $this->service->isWithinOperatingHours($start, $end)) {
                    $checkError = 'Jadwal reservasi harus berada di dalam jam operasional restoran (10:00 - 22:00) dan selesai sebelum jam 22:00.';
                } else {
                    $availableTables = $this->service->availableTables($start, $end, $guestCount);
                }
            } catch (Exception $e) {
                $checkError = 'Format waktu atau parameter tidak valid.';
            }
        }

        return Inertia::render('Reservations/Create', [
            'customers' => Customer::orderBy('name')->get(['id', 'name', 'phone']),
            'availableTables' => $availableTables,
            'checkError' => $checkError,
            'maxTableCapacity' => $maxCapacity,
            'params' => $request->only(['start_at', 'guest_count', 'customer_id']),
        ]);
    }

    /**
     * Simpan reservasi baru lewat ReservationService (Unit 6: DB Transaction & Concurrency Control).
     */
    public function store(StoreReservationRequest $request): RedirectResponse
    {
        try {
            $reservation = $this->service->create($request->validated(), auth()->id());

            return redirect()
                ->route('reservations.show', $reservation)
                ->with('success', "Reservasi berhasil dibuat dengan kode {$reservation->code}.");
        } catch (TableUnavailableException|InvalidArgumentException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        } catch (Exception $e) {
            return back()->withInput()->with('error', 'Terjadi kesalahan sistem saat membuat reservasi.');
        }
    }

    /**
     * Tampilkan detail reservasi beserta riwayat pesanan dan tombol aksi status (Unit 4).
     */
    public function show(Reservation $reservation): Response
    {
        $reservation->load(['customer', 'restaurantTable', 'user', 'orders.items.menu']);

        // Tentukan aksi yang diizinkan berdasarkan status saat ini
        $allowedTransitions = $reservation->status->allowedTransitions();
        $actions = [];
        if (in_array(ReservationStatus::Dikonfirmasi, $allowedTransitions, true)) {
            $actions[] = 'confirm';
        }
        if (in_array(ReservationStatus::Selesai, $allowedTransitions, true)) {
            $actions[] = 'complete';
        }
        if (in_array(ReservationStatus::Dibatalkan, $allowedTransitions, true)) {
            $actions[] = 'cancel';
        }

        return Inertia::render('Reservations/Show', [
            'reservation' => new ReservationResource($reservation),
            'actions' => $actions,
        ]);
    }

    /**
     * Unduh bukti reservasi dalam format PDF (Unit 5 & 6).
     */
    public function exportPdf(Reservation $reservation)
    {
        $reservation->load(['customer', 'restaurantTable', 'user', 'orders.items.menu']);

        $pdf = Pdf::loadView('pdf.reservation', [
            'reservation' => $reservation,
        ])->setPaper('a4', 'portrait');

        return $pdf->download("bukti-reservasi-{$reservation->code}.pdf");
    }

    /**
     * Konfirmasi reservasi.
     */
    public function confirm(Reservation $reservation): RedirectResponse
    {
        try {
            $this->service->confirm($reservation);

            return back()->with('success', 'Reservasi berhasil dikonfirmasi.');
        } catch (InvalidStatusTransitionException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Selesaikan reservasi.
     */
    public function complete(Reservation $reservation): RedirectResponse
    {
        try {
            $this->service->complete($reservation);

            return back()->with('success', 'Reservasi berhasil diselesaikan.');
        } catch (InvalidStatusTransitionException|InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Batalkan reservasi dan pesanan aktifnya.
     */
    public function cancel(Reservation $reservation): RedirectResponse
    {
        try {
            $this->service->cancel($reservation);

            return back()->with('success', 'Reservasi dan pesanan terkait berhasil dibatalkan.');
        } catch (InvalidStatusTransitionException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Hapus / batalkan reservasi lewat destroy.
     */
    public function destroy(Reservation $reservation): RedirectResponse
    {
        try {
            $this->service->cancel($reservation);

            return redirect()->route('reservations.index')->with('success', 'Reservasi berhasil dibatalkan.');
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}

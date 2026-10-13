<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\ReservationStatus;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\MenuCategory;
use App\Models\Order;
use App\Models\Reservation;
use App\Services\OrderService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * OrderController — Controller tipis untuk pesanan restoran (Unit 2 & 4).
 * Seluruh logika perhitungan dan transaksi didelegasikan ke OrderService.
 */
class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * Tampilkan daftar pesanan dengan filter status, tanggal, dan pencarian.
     */
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with(['reservation.customer', 'reservation.restaurantTable', 'user'])
            ->when($request->search, function ($q, $search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('reservation.customer', fn ($sq) => $sq->where('name', 'like', "%{$search}%"));
            })
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->date, fn ($q, $date) => $q->whereDate('created_at', $date))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => OrderResource::collection($orders),
            'statuses' => array_map(fn ($s) => $s->value, OrderStatus::cases()),
            'filters' => $request->only(['search', 'status', 'date']),
        ]);
    }

    /**
     * Tampilkan form pembuatan pesanan baru untuk reservasi yang dikonfirmasi.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $reservationId = $request->query('reservation');
        $selectedReservation = null;

        if ($reservationId) {
            $selectedReservation = Reservation::with(['customer', 'restaurantTable'])->find($reservationId);

            if (! $selectedReservation) {
                return redirect()->route('reservations.index')->with('error', 'Reservasi tidak ditemukan.');
            }

            if ($selectedReservation->status !== ReservationStatus::Dikonfirmasi) {
                return redirect()
                    ->route('reservations.show', $selectedReservation->id)
                    ->with('error', "Pesanan hanya dapat dibuat untuk reservasi yang berstatus dikonfirmasi (Status saat ini: {$selectedReservation->status->value}).");
            }
        }

        // Ambil daftar reservasi aktif yang berstatus dikonfirmasi jika belum ditentukan di query URL
        $confirmedReservations = Reservation::with(['customer', 'restaurantTable'])
            ->where('status', ReservationStatus::Dikonfirmasi)
            ->latest('start_at')
            ->get();

        // Ambil kategori beserta daftar menu aktif
        $categories = MenuCategory::with(['menus' => function ($q) {
            $q->orderBy('name');
        }])->orderBy('name')->get();

        return Inertia::render('Orders/Create', [
            'reservation' => $selectedReservation,
            'confirmedReservations' => $confirmedReservations,
            'categories' => $categories,
            'taxPercent' => (float) config('restaurant.tax_percent', 10),
            'servicePercent' => (float) config('restaurant.service_percent', 5),
        ]);
    }

    /**
     * Simpan pesanan baru lewat OrderService di dalam DB Transaction.
     */
    public function store(StoreOrderRequest $request): RedirectResponse
    {
        try {
            $order = $this->orderService->create($request->validated(), auth()->id());

            return redirect()
                ->route('orders.show', $order)
                ->with('success', "Pesanan {$order->order_number} berhasil dibuat.");
        } catch (InvalidArgumentException $e) {
            return back()->withInput()->with('error', $e->getMessage());
        } catch (Exception $e) {
            return back()->withInput()->with('error', 'Terjadi kesalahan sistem saat membuat pesanan.');
        }
    }

    /**
     * Tampilkan detail pesanan (struk rincian menu, subtotal, pajak, biaya layanan, total).
     */
    public function show(Order $order): Response
    {
        $order->load([
            'reservation.customer',
            'reservation.restaurantTable',
            'user',
            'items.menu.category',
        ]);

        return Inertia::render('Orders/Show', [
            'order' => new OrderResource($order),
            'canComplete' => $order->status === OrderStatus::Dibuat,
            'canCancel' => $order->status === OrderStatus::Dibuat,
        ]);
    }

    /**
     * Selesaikan pesanan.
     */
    public function complete(Order $order): RedirectResponse
    {
        try {
            $this->orderService->complete($order);

            return back()->with('success', "Pesanan {$order->order_number} berhasil diselesaikan.");
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Batalkan pesanan.
     */
    public function cancel(Order $order): RedirectResponse
    {
        try {
            $this->orderService->cancel($order);

            return back()->with('success', "Pesanan {$order->order_number} berhasil dibatalkan.");
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}

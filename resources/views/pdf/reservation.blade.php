<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Bukti Reservasi - {{ $reservation->code }}</title>
    <style>
        @page {
            margin: 24px;
        }
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333333;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header table {
            width: 100%;
        }
        .app-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e1b4b;
            margin: 0;
        }
        .app-subtitle {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
        }
        .doc-title {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            color: #4f46e5;
            margin: 0;
            text-transform: uppercase;
        }
        .doc-code {
            text-align: right;
            font-size: 12px;
            font-weight: bold;
            color: #111827;
            margin-top: 2px;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 18px;
            margin-bottom: 10px;
        }
        table.info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.info-table td {
            padding: 5px 8px;
            vertical-align: top;
        }
        table.info-table td.label {
            width: 28%;
            font-weight: bold;
            color: #4b5563;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
        }
        table.info-table td.value {
            width: 72%;
            border: 1px solid #e5e7eb;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            text-transform: uppercase;
        }
        .badge-pending { background-color: #fef3c7; color: #92400e; }
        .badge-confirmed { background-color: #d1fae5; color: #065f46; }
        .badge-completed { background-color: #e0e7ff; color: #3730a3; }
        .badge-cancelled { background-color: #fee2e2; color: #991b1b; }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 15px;
        }
        table.data-table th {
            background-color: #4f46e5;
            color: #ffffff;
            font-weight: bold;
            font-size: 11px;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #4338ca;
        }
        table.data-table td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f9fafb;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px dashed #d1d5db;
            font-size: 10px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td style="vertical-align: top;">
                    <div class="app-title">🍴 Sistem Pemesanan Restoran</div>
                    <div class="app-subtitle">Jl. Kuliner No. 123, Jakarta • Telp: (021) 555-7890</div>
                </td>
                <td style="vertical-align: top; text-align: right;">
                    <div class="doc-title">BUKTI RESERVASI</div>
                    <div class="doc-code">{{ $reservation->code }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-title">Informasi Reservasi</div>
    <table class="info-table">
        <tr>
            <td class="label">Kode Reservasi</td>
            <td class="value"><strong>{{ $reservation->code }}</strong></td>
        </tr>
        <tr>
            <td class="label">Status</td>
            <td class="value">
                @php
                    $statusVal = $reservation->status instanceof \App\Enums\ReservationStatus ? $reservation->status->value : $reservation->status;
                    $badgeClass = match($statusVal) {
                        'dipesan' => 'badge-pending',
                        'dikonfirmasi' => 'badge-confirmed',
                        'selesai' => 'badge-completed',
                        'dibatalkan' => 'badge-cancelled',
                        default => 'badge-pending',
                    };
                    $statusLabel = match($statusVal) {
                        'dipesan' => 'Dipesan (Pending)',
                        'dikonfirmasi' => 'Dikonfirmasi',
                        'selesai' => 'Selesai',
                        'dibatalkan' => 'Dibatalkan',
                        default => ucfirst($statusVal),
                    };
                @endphp
                <span class="badge {{ $badgeClass }}">{{ $statusLabel }}</span>
            </td>
        </tr>
        <tr>
            <td class="label">Nama Pelanggan</td>
            <td class="value">{{ $reservation->customer->name ?? '-' }} ({{ $reservation->customer->phone ?? '-' }})</td>
        </tr>
        <tr>
            <td class="label">Meja Restoran</td>
            <td class="value">Meja {{ $reservation->restaurantTable->code ?? '-' }} (Kapasitas: {{ $reservation->restaurantTable->capacity ?? '-' }} orang, Lokasi: {{ $reservation->restaurantTable->location ?? '-' }})</td>
        </tr>
        <tr>
            <td class="label">Waktu Mulai</td>
            <td class="value">{{ \Carbon\Carbon::parse($reservation->start_at)->translatedFormat('l, d F Y - H:i') }} WIB</td>
        </tr>
        <tr>
            <td class="label">Waktu Selesai</td>
            <td class="value">{{ \Carbon\Carbon::parse($reservation->end_at)->translatedFormat('l, d F Y - H:i') }} WIB</td>
        </tr>
        <tr>
            <td class="label">Jumlah Tamu</td>
            <td class="value">{{ $reservation->guest_count }} Orang</td>
        </tr>
        @if($reservation->notes)
        <tr>
            <td class="label">Catatan Khusus</td>
            <td class="value">{{ $reservation->notes }}</td>
        </tr>
        @endif
        <tr>
            <td class="label">Petugas / Kasir</td>
            <td class="value">{{ $reservation->user->name ?? '-' }}</td>
        </tr>
    </table>

    <div class="section-title">Pesanan Terkait</div>
    @if($reservation->orders && $reservation->orders->count() > 0)
        @foreach($reservation->orders as $order)
            <div style="margin-bottom: 12px;">
                <table style="width: 100%; margin-bottom: 4px;">
                    <tr>
                        <td style="font-weight: bold; font-size: 11px;">Pesanan #{{ $order->order_number ?? $order->code }} (Status: {{ ucfirst($order->status->value ?? $order->status) }})</td>
                        <td style="text-align: right; font-size: 10px; color: #6b7280;">Dibuat: {{ \Carbon\Carbon::parse($order->created_at)->format('d/m/Y H:i') }}</td>
                    </tr>
                </table>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">No</th>
                            <th style="width: 45%;">Menu</th>
                            <th class="text-right" style="width: 15%;">Harga Satuan</th>
                            <th class="text-center" style="width: 10%;">Qty</th>
                            <th class="text-right" style="width: 25%;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->items as $idx => $item)
                            <tr>
                                <td class="text-center">{{ $idx + 1 }}</td>
                                <td>{{ $item->menu->name ?? '-' }}</td>
                                <td class="text-right">Rp {{ number_format($item->price_at_order, 0, ',', '.') }}</td>
                                <td class="text-center">{{ $item->qty }}</td>
                                <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold; background-color: #f9fafb;">Subtotal</td>
                            <td class="text-right" style="font-weight: bold;">Rp {{ number_format($order->subtotal, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="text-right" style="background-color: #f9fafb;">Pajak (10%)</td>
                            <td class="text-right">Rp {{ number_format($order->tax, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="text-right" style="background-color: #f9fafb;">Biaya Layanan (5%)</td>
                            <td class="text-right">Rp {{ number_format($order->service_charge, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold; font-size: 12px; background-color: #eef2ff; color: #3730a3;">Total Tagihan</td>
                            <td class="text-right" style="font-weight: bold; font-size: 12px; background-color: #eef2ff; color: #3730a3;">Rp {{ number_format($order->total, 0, ',', '.') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        @endforeach
    @else
        <p style="font-style: italic; color: #6b7280; padding: 8px 0;">Belum ada pesanan menu untuk reservasi ini.</p>
    @endif

    <div class="footer">
        <table style="width: 100%;">
            <tr>
                <td style="width: 60%; vertical-align: top;">
                    Dicetak secara otomatis oleh sistem pada: {{ now()->translatedFormat('d F Y H:i:s') }} WIB.<br>
                    Harap simpan bukti reservasi ini dan tunjukkan kepada staf restoran saat kedatangan.
                </td>
                <td style="width: 40%; text-align: center; vertical-align: top;">
                    <div>Petugas / Penerima</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: bold;">( {{ $reservation->user->name ?? 'Staf Restoran' }} )</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Restoran ({{ $from->format('d/m/Y') }} - {{ $to->format('d/m/Y') }})</title>
    <style>
        @page {
            margin: 24px;
        }
        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #333333;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
            margin-bottom: 16px;
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
            font-size: 10px;
            color: #6b7280;
            margin-top: 2px;
        }
        .doc-title {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            color: #4f46e5;
            margin: 0;
        }
        .period-info {
            text-align: right;
            font-size: 10px;
            color: #374151;
            margin-top: 2px;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 14px;
            margin-bottom: 8px;
        }
        table.kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        table.kpi-table td {
            width: 25%;
            padding: 8px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        .kpi-label {
            font-size: 9px;
            text-transform: uppercase;
            font-weight: bold;
            color: #64748b;
        }
        .kpi-val {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 3px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
        }
        table.data-table th {
            background-color: #4f46e5;
            color: #ffffff;
            font-weight: bold;
            font-size: 10px;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #4338ca;
        }
        table.data-table td {
            padding: 5px 6px;
            border: 1px solid #e5e7eb;
            font-size: 10px;
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
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px dashed #d1d5db;
            font-size: 9px;
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
                    <div class="doc-title">LAPORAN OPERASIONAL</div>
                    <div class="period-info">Periode: {{ $from->format('d/m/Y') }} s/d {{ $to->format('d/m/Y') }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Ringkasan Eksekutif -->
    @php
        $totalReservations = array_sum(array_column($summary, 'count'));
        $totalGuests = array_sum(array_column($summary, 'guests'));
        $confirmedOrDone = ($summary['dikonfirmasi']['count'] ?? 0) + ($summary['selesai']['count'] ?? 0);
    @endphp
    <table class="kpi-table">
        <tr>
            <td>
                <div class="kpi-label">Total Pendapatan (Selesai)</div>
                <div class="kpi-val" style="color: #059669;">Rp {{ number_format($revenue, 0, ',', '.') }}</div>
            </td>
            <td>
                <div class="kpi-label">Total Reservasi</div>
                <div class="kpi-val">{{ $totalReservations }}</div>
            </td>
            <td>
                <div class="kpi-label">Reservasi Sukses</div>
                <div class="kpi-val">{{ $confirmedOrDone }}</div>
            </td>
            <td>
                <div class="kpi-label">Total Tamu Dilayani</div>
                <div class="kpi-val">{{ $totalGuests }} Orang</div>
            </td>
        </tr>
    </table>

    <!-- Ringkasan Status Reservasi -->
    <div class="section-title">1. Ringkasan Status Reservasi</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 40%;">Status</th>
                <th class="text-center" style="width: 30%;">Jumlah Reservasi</th>
                <th class="text-center" style="width: 30%;">Total Tamu</th>
            </tr>
        </thead>
        <tbody>
            @foreach($summary as $status => $data)
                <tr>
                    <td style="font-weight: bold; text-transform: capitalize;">{{ $status }}</td>
                    <td class="text-center">{{ $data['count'] }}</td>
                    <td class="text-center">{{ $data['guests'] }} Orang</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Menu Terlaris -->
    <div class="section-title">2. Daftar Menu Terlaris (Pesanan Selesai)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 8%;" class="text-center">No</th>
                <th style="width: 52%;">Nama Menu</th>
                <th class="text-center" style="width: 20%;">Total Terjual (Qty)</th>
                <th class="text-right" style="width: 20%;">Total Penjualan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($topMenus as $idx => $menu)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $menu->name }}</td>
                    <td class="text-center">{{ $menu->total_qty }} porsi</td>
                    <td class="text-right">Rp {{ number_format($menu->total_sales ?? 0, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="font-style: italic; color: #6b7280;">Belum ada data penjualan menu pada periode ini.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Pemakaian Meja -->
    <div class="section-title">3. Penggunaan Meja Restoran</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">Kode Meja</th>
                <th style="width: 25%;">Kapasitas & Lokasi</th>
                <th class="text-center" style="width: 30%;">Frekuensi Reservasi</th>
                <th class="text-center" style="width: 30%;">Total Tamu</th>
            </tr>
        </thead>
        <tbody>
            @forelse($tableUsage as $tbl)
                <tr>
                    <td style="font-weight: bold;">Meja {{ $tbl->code }}</td>
                    <td>{{ $tbl->capacity }} Kursi • {{ $tbl->location }}</td>
                    <td class="text-center">{{ $tbl->total_reservations }} kali</td>
                    <td class="text-center">{{ $tbl->total_guests }} orang</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center" style="font-style: italic; color: #6b7280;">Belum ada data penggunaan meja.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Kinerja Staf -->
    @if(isset($staffPerformance) && $staffPerformance->count() > 0)
    <div class="section-title">4. Kinerja Petugas / Staf</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 10%;" class="text-center">No</th>
                <th style="width: 40%;">Nama Petugas</th>
                <th style="width: 20%;">Role</th>
                <th class="text-center" style="width: 15%;">Reservasi Dibuat</th>
                <th class="text-center" style="width: 15%;">Pesanan Ditangani</th>
            </tr>
        </thead>
        <tbody>
            @foreach($staffPerformance as $idx => $staff)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td style="font-weight: bold;">{{ $staff->name }}</td>
                    <td style="text-transform: capitalize;">{{ $staff->role }}</td>
                    <td class="text-center">{{ $staff->total_reservations }}</td>
                    <td class="text-center">{{ $staff->total_orders }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <table style="width: 100%;">
            <tr>
                <td style="width: 70%; vertical-align: top;">
                    Laporan diexport otomatis oleh sistem pada {{ now()->translatedFormat('d F Y H:i:s') }} WIB.<br>
                    Dokumen ini adalah rekapitulasi data resmi operasional restoran.
                </td>
                <td style="width: 30%; text-align: center; vertical-align: top;">
                    <div>Penanggung Jawab / Admin</div>
                    <div style="height: 40px;"></div>
                    <div style="font-weight: bold;">( {{ auth()->user()->name ?? 'Administrator' }} )</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>

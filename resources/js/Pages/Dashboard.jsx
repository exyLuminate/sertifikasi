import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BookingChart from '@/Components/BookingChart';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    DollarSign,
    CalendarDays,
    Users,
    Armchair,
    Plus,
    ClipboardList,
    Clock,
    ArrowRight,
    Utensils,
    CheckCircle,
} from 'lucide-react';

/**
 * Halaman Dashboard adaptif berbasis role (Colorful Flat Design — design-system.md).
 *
 * Menerapkan:
 * - 4 Aksen warna: Cobalt Blue (#4361EE), Teal (#2EC4B6), Orange (#FF9F1C), Lavender (#B8B8FF).
 * - Lucide React Iconography (tanpa emoji).
 * - Layout Flat Card dengan border tipis #E4E7EF tanpa bayangan tebal.
 */
export default function Dashboard({
    role = 'staf',
    summary = {},
    revenue = 0,
    dailyReservations = { labels: [], values: [] },
    totalTablesCount = 0,
    topMenus = [],
    todayReservations = [],
    runningOrders = [],
    activeTables = [],
}) {
    const { auth } = usePage().props;
    const isAdmin = role === 'admin' || auth.user?.role === 'admin';

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalReservationsToday = Object.values(summary).reduce((acc, curr) => acc + (curr.count || 0), 0);
    const totalGuestsToday = Object.values(summary).reduce((acc, curr) => acc + (curr.guests || 0), 0);

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Header Welcome Bar (Colorful Flat Solid) */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-[#242943]">
                            Selamat Datang, {auth.user?.name}!
                        </h1>
                        <p className="text-xs text-[#737B91] mt-1">
                            Anda masuk sebagai{' '}
                            <span className="font-bold uppercase text-[#4361EE]">{auth.user?.role}</span> di sistem
                            operasional restoran.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('reservations.create')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                            <Plus size={15} />
                            <span>Buat Reservasi</span>
                        </Link>
                        <Link
                            href={route('orders.create')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F7F8FC] text-[#242943] border border-[#E4E7EF] rounded-lg text-xs font-semibold transition-colors"
                        >
                            <ClipboardList size={15} className="text-[#4361EE]" />
                            <span>Catat Pesanan</span>
                        </Link>
                    </div>
                </div>

                {/* ============================================================== */}
                {/* TAMPILAN ADMIN                                                */}
                {/* ============================================================== */}
                {isAdmin ? (
                    <>
                        {/* 4 KPI Cards (Cobalt Blue, Teal, Orange, Lavender) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card 1: Pendapatan (Teal #2EC4B6) */}
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                        Pendapatan Hari Ini
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#2EC4B6] flex items-center justify-center">
                                        <DollarSign size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-2xl font-bold text-[#242943]">{formatRupiah(revenue)}</p>
                                    <p className="text-[11px] text-[#737B91] mt-1">Dari pesanan berstatus Selesai</p>
                                </div>
                            </div>

                            {/* Card 2: Reservasi (Cobalt Blue #4361EE) */}
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                        Reservasi Hari Ini
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                                        <CalendarDays size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-2xl font-bold text-[#242943]">{totalReservationsToday}</p>
                                    <p className="text-[11px] text-[#737B91] mt-1">Total jadwal pemesanan</p>
                                </div>
                            </div>

                            {/* Card 3: Tamu (Orange #FF9F1C) */}
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                        Tamu Hari Ini
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#FF9F1C] flex items-center justify-center">
                                        <Users size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-2xl font-bold text-[#242943]">{totalGuestsToday} Orang</p>
                                    <p className="text-[11px] text-[#737B91] mt-1">Estimasi jumlah pengunjung</p>
                                </div>
                            </div>

                            {/* Card 4: Meja Terpakai (Lavender #B8B8FF) */}
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                        Meja Terpakai
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-[#F5F5FF] text-[#6366F1] flex items-center justify-center">
                                        <Armchair size={18} />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="text-2xl font-bold text-[#242943]">
                                        {activeTables.length}{' '}
                                        <span className="text-xs font-normal text-[#737B91]">/ {totalTablesCount} meja</span>
                                    </p>
                                    <p className="text-[11px] text-[#737B91] mt-1">Reservasi aktif saat ini</p>
                                </div>
                            </div>
                        </div>

                        {/* Grafik Tren 7 Hari */}
                        <BookingChart
                            labels={dailyReservations.labels}
                            values={dailyReservations.values}
                            title="Tren Reservasi 7 Hari Terakhir"
                        />

                        {/* Grid: Meja Terpakai & Menu Terlaris */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Meja Aktif Saat Ini */}
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Armchair size={18} className="text-[#4361EE]" />
                                        <h2 className="text-sm font-bold text-[#242943]">Meja Terpakai Saat Ini</h2>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EEF2FF] text-[#4361EE]">
                                        {activeTables.length} meja aktif
                                    </span>
                                </div>

                                {activeTables.length === 0 ? (
                                    <div className="py-8 text-center text-[#737B91] text-xs italic">
                                        Saat ini tidak ada meja yang sedang terisi oleh reservasi.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#E4E7EF]">
                                        {activeTables.map((res) => (
                                            <div key={res.id} className="py-3 flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="font-bold text-[#242943]">
                                                        Meja {res.restaurant_table?.code}
                                                    </span>
                                                    <span className="text-[#737B91] ml-2">
                                                        ({res.customer?.name} • {res.guest_count} tamu)
                                                    </span>
                                                    <div className="text-[11px] text-[#737B91] mt-0.5">
                                                        {res.start_at} - {res.end_at}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('reservations.show', res.id)}
                                                    className="inline-flex items-center gap-1 text-[#4361EE] hover:underline font-semibold"
                                                >
                                                    <span>Detail</span>
                                                    <ArrowRight size={13} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Menu Terlaris */}
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Utensils size={18} className="text-[#FF9F1C]" />
                                        <h2 className="text-sm font-bold text-[#242943]">Menu Terpopuler (7 Hari)</h2>
                                    </div>
                                </div>

                                {topMenus.length === 0 ? (
                                    <div className="py-8 text-center text-[#737B91] text-xs italic">
                                        Belum ada penjualan menu yang selesai dalam 7 hari terakhir.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-[#E4E7EF]">
                                        {topMenus.map((m, idx) => (
                                            <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#737B91] w-4">#{idx + 1}</span>
                                                    <span className="font-medium text-[#242943]">{m.name}</span>
                                                </div>
                                                <span className="px-2.5 py-1 bg-[#F0FDFA] text-[#2EC4B6] font-bold rounded-md">
                                                    {m.total_qty} porsi
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* ============================================================== */
                    /* TAMPILAN STAF                                                  */
                    /* ============================================================== */
                    <div className="space-y-6">
                        {/* 3 KPI Cards Staf */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                                <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                    Jadwal Hari Ini
                                </span>
                                <p className="mt-2 text-2xl font-bold text-[#242943]">{todayReservations.length}</p>
                                <p className="text-[11px] text-[#737B91] mt-1">Reservasi yang dijadwalkan hari ini</p>
                            </div>

                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                                <span className="text-xs font-bold text-[#FF9F1C] uppercase tracking-wider">
                                    Pesanan Sedang Diproses
                                </span>
                                <p className="mt-2 text-2xl font-bold text-[#FF9F1C]">{runningOrders.length}</p>
                                <p className="text-[11px] text-[#737B91] mt-1">Status Dibuat (belum dibayar)</p>
                            </div>

                            <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                                <span className="text-xs font-bold text-[#2EC4B6] uppercase tracking-wider">
                                    Meja Sedang Terisi
                                </span>
                                <p className="mt-2 text-2xl font-bold text-[#2EC4B6]">{activeTables.length}</p>
                                <p className="text-[11px] text-[#737B91] mt-1">Tamu sedang aktif di restoran</p>
                            </div>
                        </div>

                        {/* Tabel Reservasi Hari Ini */}
                        <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays size={18} className="text-[#4361EE]" />
                                    <h2 className="text-sm font-bold text-[#242943]">Reservasi Hari Ini</h2>
                                </div>
                                <Link
                                    href={route('reservations.index')}
                                    className="text-xs font-semibold text-[#4361EE] hover:underline"
                                >
                                    Semua Reservasi &rarr;
                                </Link>
                            </div>

                            {todayReservations.length === 0 ? (
                                <div className="py-8 text-center text-[#737B91] text-xs italic">
                                    Tidak ada jadwal reservasi untuk hari ini.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-[#E4E7EF] text-[#737B91] uppercase">
                                                <th className="py-2.5">Waktu</th>
                                                <th className="py-2.5">Kode</th>
                                                <th className="py-2.5">Pelanggan</th>
                                                <th className="py-2.5">Meja</th>
                                                <th className="py-2.5 text-center">Tamu</th>
                                                <th className="py-2.5">Status</th>
                                                <th className="py-2.5 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E4E7EF]">
                                            {todayReservations.map((r) => (
                                                <tr key={r.id} className="hover:bg-[#F7F8FC]">
                                                    <td className="py-3 font-semibold text-[#4361EE]">
                                                        {r.start_at?.slice(11, 16)} WIB
                                                    </td>
                                                    <td className="py-3 font-mono font-bold text-[#242943]">{r.code}</td>
                                                    <td className="py-3 font-medium text-[#242943]">
                                                        {r.customer?.name} ({r.customer?.phone})
                                                    </td>
                                                    <td className="py-3 font-semibold text-[#737B91]">
                                                        Meja {r.restaurant_table?.code}
                                                    </td>
                                                    <td className="py-3 text-center">{r.guest_count} org</td>
                                                    <td className="py-3">
                                                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F8FC] border border-[#E4E7EF] text-[#242943]">
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <Link
                                                            href={route('reservations.show', r.id)}
                                                            className="text-[#4361EE] hover:underline font-semibold"
                                                        >
                                                            Buka &rarr;
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pesanan Sedang Diproses */}
                        <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-[#FF9F1C]" />
                                    <h2 className="text-sm font-bold text-[#242943]">Pesanan Aktif (Belum Selesai)</h2>
                                </div>
                                <Link
                                    href={route('orders.index')}
                                    className="text-xs font-semibold text-[#4361EE] hover:underline"
                                >
                                    Semua Pesanan &rarr;
                                </Link>
                            </div>

                            {runningOrders.length === 0 ? (
                                <div className="py-8 text-center text-[#737B91] text-xs italic">
                                    Tidak ada pesanan yang sedang diproses saat ini.
                                </div>
                            ) : (
                                <div className="divide-y divide-[#E4E7EF]">
                                    {runningOrders.map((ord) => (
                                        <div
                                            key={ord.id}
                                            className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                                        >
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-[#242943]">
                                                        #{ord.order_number}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7ED] text-[#FF9F1C]">
                                                        Dibuat
                                                    </span>
                                                </div>
                                                <div className="text-[#737B91] mt-1">
                                                    Meja {ord.reservation?.restaurant_table?.code ?? '-'} •{' '}
                                                    {ord.reservation?.customer?.name ?? 'Walk-in'} •{' '}
                                                    {ord.items?.length || 0} menu
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-[#242943]">{formatRupiah(ord.total)}</span>
                                                <Link
                                                    href={route('orders.show', ord.id)}
                                                    className="px-3 py-1.5 bg-[#EEF2FF] text-[#4361EE] hover:bg-[#E0E7FF] font-semibold rounded-lg transition-colors"
                                                >
                                                    Lihat &amp; Selesaikan
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

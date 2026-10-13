import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BookingChart from '@/Components/BookingChart';
import { Head, router } from '@inertiajs/react';
import {
    FileDown,
    DollarSign,
    CalendarDays,
    CheckCircle2,
    Users,
    Award,
    Armchair,
    UserCheck,
    Filter,
} from 'lucide-react';

/**
 * Halaman Laporan Operasional Restoran (Admin) — Colorful Flat Design.
 */
export default function ReportsIndex({
    period,
    from,
    to,
    summary = {},
    tableUsage = [],
    dailyReservations = { labels: [], values: [] },
    topMenus = [],
    revenue = 0,
    staffPerformance = [],
}) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || 'today');
    const [customFrom, setCustomFrom] = useState(from || '');
    const [customTo, setCustomTo] = useState(to || '');

    const handleApplyFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('reports.index'),
            {
                period: selectedPeriod,
                ...(selectedPeriod === 'custom' ? { from: customFrom, to: customTo } : {}),
            },
            { preserveState: true }
        );
    };

    const pdfUrl = route('reports.pdf', {
        period: selectedPeriod,
        ...(selectedPeriod === 'custom' ? { from: customFrom, to: customTo } : {}),
    });

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const totalReservations = Object.values(summary).reduce((acc, curr) => acc + (curr.count || 0), 0);
    const totalGuests = Object.values(summary).reduce((acc, curr) => acc + (curr.guests || 0), 0);
    const confirmedOrDone = (summary.dikonfirmasi?.count || 0) + (summary.selesai?.count || 0);

    return (
        <AuthenticatedLayout header="Laporan Operasional">
            <Head title="Laporan Operasional" />

            <div className="space-y-6">
                {/* Header & Filter Card */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-base font-bold text-[#242943]">Rekapitulasi Operasional Restoran</h1>
                            <p className="text-xs text-[#737B91] mt-0.5">
                                Periode aktif: <span className="font-semibold text-[#242943]">{from}</span> s/d{' '}
                                <span className="font-semibold text-[#242943]">{to}</span>
                            </p>
                        </div>

                        {/* Tombol Cetak PDF menggunakan <a> biasa */}
                        <div>
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                                <FileDown size={16} />
                                <span>Unduh Laporan PDF</span>
                            </a>
                        </div>
                    </div>

                    <hr className="my-4 border-[#E4E7EF]" />

                    {/* Filter Form */}
                    <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-3 text-sm">
                        <div>
                            <label className="block text-xs font-medium text-[#242943] mb-1.5">Pilih Periode</label>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="rounded-lg border-[#E4E7EF] text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE] py-2 px-3"
                            >
                                <option value="today">Hari Ini</option>
                                <option value="7_days">7 Hari Terakhir</option>
                                <option value="this_month">Bulan Ini</option>
                                <option value="custom">Rentang Bebas</option>
                            </select>
                        </div>

                        {selectedPeriod === 'custom' && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-[#242943] mb-1.5">Dari Tanggal</label>
                                    <input
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        className="rounded-lg border-[#E4E7EF] text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE] py-2 px-3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#242943] mb-1.5">Sampai Tanggal</label>
                                    <input
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        className="rounded-lg border-[#E4E7EF] text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE] py-2 px-3"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                            <Filter size={14} />
                            <span>Terapkan Filter</span>
                        </button>
                    </form>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                Pendapatan Selesai
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#2EC4B6] flex items-center justify-center">
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[#242943]">{formatRupiah(revenue)}</p>
                        <p className="text-[11px] text-[#737B91] mt-1">Hanya dari pesanan Selesai</p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                Total Reservasi
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                                <CalendarDays size={18} />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[#242943]">{totalReservations}</p>
                        <p className="text-[11px] text-[#737B91] mt-1">Semua status pemesanan</p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                Reservasi Sukses
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center">
                                <CheckCircle2 size={18} />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[#242943]">{confirmedOrDone}</p>
                        <p className="text-[11px] text-[#737B91] mt-1">Dikonfirmasi &amp; Selesai</p>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#737B91] uppercase tracking-wider">
                                Total Tamu
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#FF9F1C] flex items-center justify-center">
                                <Users size={18} />
                            </div>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-[#242943]">{totalGuests} Orang</p>
                        <p className="text-[11px] text-[#737B91] mt-1">Akumulasi jumlah tamu</p>
                    </div>
                </div>

                {/* Grafik Tren Harian */}
                <BookingChart
                    labels={dailyReservations.labels}
                    values={dailyReservations.values}
                    title="Grafik Tren Reservasi Harian"
                />

                {/* Grid 2 Kolom: Ringkasan Status & Menu Terlaris */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ringkasan Status Reservasi */}
                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <h2 className="text-sm font-bold text-[#242943] mb-3">Status Reservasi</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E4E7EF] text-[#737B91] font-semibold uppercase">
                                        <th className="py-2.5">Status</th>
                                        <th className="py-2.5 text-center">Jumlah Reservasi</th>
                                        <th className="py-2.5 text-right">Total Tamu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E7EF]">
                                    {Object.entries(summary).map(([st, val]) => (
                                        <tr key={st} className="hover:bg-[#F7F8FC]">
                                            <td className="py-3 font-semibold capitalize text-[#242943]">
                                                {st === 'dipesan' && 'Dipesan (Pending)'}
                                                {st === 'dikonfirmasi' && 'Dikonfirmasi'}
                                                {st === 'selesai' && 'Selesai'}
                                                {st === 'dibatalkan' && 'Dibatalkan'}
                                            </td>
                                            <td className="py-3 text-center font-bold text-[#242943]">{val.count}</td>
                                            <td className="py-3 text-right text-[#737B91]">{val.guests} orang</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Menu Terlaris */}
                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Award size={18} className="text-[#FF9F1C]" />
                            <h2 className="text-sm font-bold text-[#242943]">5 Menu Terlaris</h2>
                        </div>
                        {topMenus.length === 0 ? (
                            <div className="py-8 text-center text-[#737B91] text-xs italic">
                                Belum ada data penjualan menu pada periode ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E4E7EF] text-[#737B91] font-semibold uppercase">
                                        <th className="py-2.5">Menu</th>
                                        <th className="py-2.5 text-center">Terjual</th>
                                        <th className="py-2.5 text-right">Total Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E7EF]">
                                    {topMenus.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-[#F7F8FC]">
                                            <td className="py-3 font-medium text-[#242943]">
                                                <span className="inline-block w-5 text-[#737B91] font-bold">
                                                    #{idx + 1}
                                                </span>
                                                {item.name}
                                            </td>
                                            <td className="py-3 text-center font-bold text-[#4361EE]">
                                                {item.total_qty} porsi
                                            </td>
                                            <td className="py-3 text-right font-semibold text-[#242943]">
                                                {formatRupiah(item.total_sales)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pemakaian Meja */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Armchair size={18} className="text-[#4361EE]" />
                        <h2 className="text-sm font-bold text-[#242943]">Frekuensi Penggunaan Meja</h2>
                    </div>
                    {tableUsage.length === 0 ? (
                        <div className="py-6 text-center text-[#737B91] text-xs italic">
                            Belum ada data penggunaan meja.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E4E7EF] text-[#737B91] font-semibold uppercase">
                                        <th className="py-2.5">Kode Meja</th>
                                        <th className="py-2.5">Kapasitas &amp; Lokasi</th>
                                        <th className="py-2.5 text-center">Frekuensi Reservasi</th>
                                        <th className="py-2.5 text-right">Total Tamu Dilayani</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E7EF]">
                                    {tableUsage.map((tbl) => (
                                        <tr key={tbl.id} className="hover:bg-[#F7F8FC]">
                                            <td className="py-3 font-bold text-[#242943]">Meja {tbl.code}</td>
                                            <td className="py-3 text-[#737B91]">
                                                {tbl.capacity} Kursi • {tbl.location}
                                            </td>
                                            <td className="py-3 text-center font-bold text-[#4361EE]">
                                                {tbl.total_reservations} kali
                                            </td>
                                            <td className="py-3 text-right text-[#242943]">{tbl.total_guests} orang</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Kinerja Staf / Petugas */}
                {staffPerformance && staffPerformance.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#E4E7EF] p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <UserCheck size={18} className="text-[#2EC4B6]" />
                            <h2 className="text-sm font-bold text-[#242943]">Kinerja Petugas / Staf</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E4E7EF] text-[#737B91] font-semibold uppercase">
                                        <th className="py-2.5">Nama Petugas</th>
                                        <th className="py-2.5">Role</th>
                                        <th className="py-2.5 text-center">Reservasi Dibuat</th>
                                        <th className="py-2.5 text-right">Pesanan Ditangani</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E7EF]">
                                    {staffPerformance.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-[#F7F8FC]">
                                            <td className="py-3 font-bold text-[#242943]">{staff.name}</td>
                                            <td className="py-3 text-[#737B91] capitalize">{staff.role}</td>
                                            <td className="py-3 text-center font-bold text-[#4361EE]">
                                                {staff.total_reservations} reservasi
                                            </td>
                                            <td className="py-3 text-right font-bold text-[#2EC4B6]">
                                                {staff.total_orders} pesanan
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

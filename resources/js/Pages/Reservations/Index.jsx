import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Plus,
    Search,
    Calendar,
    ListFilter,
    Armchair,
    ExternalLink,
    X,
    Filter,
    RotateCcw,
} from 'lucide-react';

/**
 * Reservations/Index.jsx — Daftar reservasi dengan filter lengkap dan badge status (Unit 4, 6 & Phase 4).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Index({ reservations, tables = [], statuses = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [date, setDate] = useState(filters?.date || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [tableId, setTableId] = useState(filters?.table_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('reservations.index'),
            {
                search: search || undefined,
                date: date || undefined,
                status: status || undefined,
                table_id: tableId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setDate('');
        setStatus('');
        setTableId('');
        router.get(route('reservations.index'), {}, { preserveState: true });
    };

    const handleCancel = (id, code) => {
        if (confirm(`Yakin ingin membatalkan reservasi ${code}? Pesanan aktif yang belum selesai juga akan dibatalkan.`)) {
            router.post(route('reservations.cancel', id));
        }
    };

    const getStatusBadge = (resStatus) => {
        switch (resStatus) {
            case 'dikonfirmasi':
                return 'bg-[#DBEAFE] text-[#2563EB]';
            case 'selesai':
                return 'bg-[#DCFCE7] text-[#16A34A]';
            case 'dibatalkan':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            default:
                return 'bg-[#FEF3C7] text-[#D97706]'; // dipesan
        }
    };

    const resList = reservations?.data || [];
    const paginationLinks = reservations?.links || reservations?.meta?.links || [];

    return (
        <AuthenticatedLayout header="Manajemen Reservasi">
            <div className="space-y-6">
                
                {/* Header & Tombol Tambah */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#242943]">Daftar Reservasi Meja</h2>
                        <p className="text-xs text-[#737B91] mt-0.5">
                            Kelola jadwal kedatangan pelanggan dan ketersediaan meja restoran.
                        </p>
                    </div>
                    <Link
                        href={route('reservations.create')}
                        className="inline-flex items-center justify-center gap-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                        <Plus size={16} />
                        <span>Buat Reservasi</span>
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-xl border border-[#E4E7EF]">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                        
                        {/* Pencarian */}
                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Cari Kode / Pelanggan
                            </label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737B91]" />
                                <input
                                    type="text"
                                    placeholder="Contoh: RSV atau Budi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                />
                            </div>
                        </div>

                        {/* Filter Tanggal */}
                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Tanggal Reservasi
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            />
                        </div>

                        {/* Filter Status */}
                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE] capitalize"
                            >
                                <option value="">Semua Status</option>
                                {statuses.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Meja */}
                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Meja
                            </label>
                            <select
                                value={tableId}
                                onChange={(e) => setTableId(e.target.value)}
                                className="w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            >
                                <option value="">Semua Meja</option>
                                {tables.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        Meja {t.code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tombol Terapkan & Reset */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                            >
                                <Filter size={14} />
                                <span>Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] px-3 py-2 rounded-lg text-xs font-medium transition"
                            >
                                <RotateCcw size={14} />
                                <span>Reset</span>
                            </button>
                        </div>

                    </form>
                </div>

                {/* Tabel Reservasi */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                    <th className="p-4 font-semibold">Kode Reservasi</th>
                                    <th className="p-4 font-semibold">Pelanggan</th>
                                    <th className="p-4 font-semibold">Meja</th>
                                    <th className="p-4 font-semibold">Waktu Mulai</th>
                                    <th className="p-4 font-semibold">Tamu</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4E7EF]">
                                {resList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-[#737B91] text-sm">
                                            Tidak ada data reservasi yang sesuai kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    resList.map((res) => (
                                        <tr key={res.id} className="hover:bg-[#F7F8FC] transition">
                                            {/* Kode */}
                                            <td className="p-4 font-bold">
                                                <Link
                                                    href={route('reservations.show', res.id)}
                                                    className="text-[#4361EE] hover:underline"
                                                >
                                                    {res.code}
                                                </Link>
                                            </td>

                                            {/* Pelanggan */}
                                            <td className="p-4">
                                                <div className="font-medium text-[#242943]">
                                                    {res.customer?.name || '-'}
                                                </div>
                                                <div className="text-xs text-[#737B91]">
                                                    {res.customer?.phone || '-'}
                                                </div>
                                            </td>

                                            {/* Meja */}
                                            <td className="p-4">
                                                <span className="font-semibold text-[#242943]">
                                                    {res.restaurant_table?.code || '-'}
                                                </span>
                                                {res.restaurant_table?.location && (
                                                    <span className="block text-xs text-[#737B91] capitalize">
                                                        {res.restaurant_table.location}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Waktu Mulai */}
                                            <td className="p-4 text-[#242943]">
                                                <div>{res.start_at}</div>
                                                <div className="text-xs text-[#737B91]">s/d {res.end_at}</div>
                                            </td>

                                            {/* Tamu */}
                                            <td className="p-4 font-medium text-[#242943]">
                                                {res.guest_count} Orang
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4 capitalize">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusBadge(res.status)}`}>
                                                    {res.status}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="p-4 text-right space-x-2">
                                                <Link
                                                    href={route('reservations.show', res.id)}
                                                    className="text-[#4361EE] hover:text-[#3A53D0] font-semibold text-xs inline-flex items-center gap-1"
                                                >
                                                    Detail <ExternalLink size={12} />
                                                </Link>
                                                {(res.status === 'dipesan' || res.status === 'dikonfirmasi') && (
                                                    <button
                                                        onClick={() => handleCancel(res.id, res.code)}
                                                        className="text-[#DC2626] hover:text-[#B91C1C] text-xs font-medium inline-block ml-2"
                                                    >
                                                        Batalkan
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginationLinks.length > 3 && (
                        <div className="p-4 border-t border-[#E4E7EF] flex items-center justify-between">
                            <span className="text-xs text-[#737B91]">
                                Menampilkan {resList.length} reservasi
                            </span>
                            <div className="flex gap-1">
                                {paginationLinks.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-xs border rounded-md transition ${
                                            link.active
                                                ? 'bg-[#4361EE] text-white border-[#4361EE] font-semibold'
                                                : 'bg-white text-[#242943] hover:bg-gray-50 border-[#E4E7EF]'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
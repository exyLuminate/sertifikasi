import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Plus,
    Search,
    Calendar,
    ListFilter,
    CheckCircle2,
    XCircle,
    ExternalLink,
    Filter,
    RotateCcw,
    Receipt,
} from 'lucide-react';

/**
 * Orders/Index.jsx — Daftar pesanan dengan filter status, tanggal, dan pencarian (Phase 5).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Index({ orders, statuses = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [date, setDate] = useState(filters?.date || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('orders.index'),
            {
                search: search || undefined,
                status: status || undefined,
                date: date || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDate('');
        router.get(route('orders.index'), {}, { preserveState: true });
    };

    const handleComplete = (id, orderNumber) => {
        if (confirm(`Selesaikan pesanan ${orderNumber}? Pastikan pembayaran telah diterima.`)) {
            router.post(route('orders.complete', id));
        }
    };

    const handleCancel = (id, orderNumber) => {
        if (confirm(`Batalkan pesanan ${orderNumber}? Aksi ini tidak dapat diubah kembali.`)) {
            router.post(route('orders.cancel', id));
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'selesai':
                return 'bg-[#DCFCE7] text-[#16A34A]';
            case 'dibatalkan':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            default:
                return 'bg-[#FEF3C7] text-[#D97706]'; // dibuat
        }
    };

    const orderList = orders?.data || [];
    const paginationLinks = orders?.links || orders?.meta?.links || [];

    return (
        <AuthenticatedLayout header="Manajemen Pesanan">
            <div className="space-y-6">

                {/* Header & Tombol Buat Pesanan */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#242943]">Daftar Pesanan Meja</h2>
                        <p className="text-xs text-[#737B91] mt-0.5">
                            Kelola pesanan makanan/minuman dan pantau status transaksi meja.
                        </p>
                    </div>
                    <Link
                        href={route('orders.create')}
                        className="inline-flex items-center justify-center gap-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                        <Plus size={16} />
                        <span>Buat Pesanan</span>
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-xl border border-[#E4E7EF]">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Cari Nomor / Pelanggan
                            </label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737B91]" />
                                <input
                                    type="text"
                                    placeholder="Contoh: ORD atau Budi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Status Pesanan
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

                        <div>
                            <label className="block text-xs font-semibold text-[#242943] mb-1">
                                Tanggal Pesanan
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            />
                        </div>

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

                {/* Tabel Pesanan */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                    <th className="p-4 font-semibold">Nomor Pesanan</th>
                                    <th className="p-4 font-semibold">Reservasi & Meja</th>
                                    <th className="p-4 font-semibold">Pelanggan</th>
                                    <th className="p-4 font-semibold">Waktu Pesan</th>
                                    <th className="p-4 font-semibold">Total Tagihan</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4E7EF]">
                                {orderList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-[#737B91] text-sm">
                                            Tidak ada data pesanan yang sesuai kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    orderList.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-[#F7F8FC] transition">
                                            {/* Nomor Pesanan */}
                                            <td className="p-4 font-bold">
                                                <Link
                                                    href={route('orders.show', ord.id)}
                                                    className="text-[#4361EE] hover:underline"
                                                >
                                                    {ord.order_number}
                                                </Link>
                                            </td>

                                            {/* Reservasi & Meja */}
                                            <td className="p-4">
                                                <div className="font-medium text-[#242943]">
                                                    Meja {ord.reservation?.restaurant_table?.code || '-'}
                                                </div>
                                                <div className="text-xs text-[#737B91]">
                                                    {ord.reservation?.code || '-'}
                                                </div>
                                            </td>

                                            {/* Pelanggan */}
                                            <td className="p-4">
                                                <div className="font-medium text-[#242943]">
                                                    {ord.reservation?.customer?.name || '-'}
                                                </div>
                                                <div className="text-xs text-[#737B91]">
                                                    {ord.reservation?.customer?.phone || '-'}
                                                </div>
                                            </td>

                                            {/* Waktu Pesan */}
                                            <td className="p-4 text-[#737B91] text-xs">
                                                {ord.created_at}
                                            </td>

                                            {/* Total Tagihan */}
                                            <td className="p-4 font-bold text-[#242943]">
                                                Rp {Number(ord.total).toLocaleString('id-ID')}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4 capitalize">
                                                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${getStatusBadge(ord.status)}`}>
                                                    {ord.status}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="p-4 text-right space-x-2">
                                                <Link
                                                    href={route('orders.show', ord.id)}
                                                    className="text-[#4361EE] hover:text-[#3A53D0] font-semibold text-xs inline-flex items-center gap-1"
                                                >
                                                    Detail <ExternalLink size={12} />
                                                </Link>
                                                {ord.status === 'dibuat' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleComplete(ord.id, ord.order_number)}
                                                            className="text-[#16A34A] hover:text-[#15803D] text-xs font-semibold inline-block ml-2"
                                                        >
                                                            Selesaikan
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(ord.id, ord.order_number)}
                                                            className="text-[#DC2626] hover:text-[#B91C1C] text-xs font-medium inline-block ml-2"
                                                        >
                                                            Batalkan
                                                        </button>
                                                    </>
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
                                Menampilkan {orderList.length} pesanan
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

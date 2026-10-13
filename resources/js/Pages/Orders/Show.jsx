import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    User,
    Utensils,
    ArrowLeft,
    ExternalLink,
} from 'lucide-react';

/**
 * Orders/Show.jsx — Halaman detail pesanan meja (struk rincian menu dan biaya) (Phase 5).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Show({ order, canComplete = false, canCancel = false }) {
    const ord = order?.data || order;
    const [processingAction, setProcessingAction] = useState(null);

    if (!ord) return null;

    const handleComplete = () => {
        if (confirm('Selesaikan pesanan ini? Pastikan seluruh pesanan telah disajikan dan pembayaran diselesaikan.')) {
            setProcessingAction('complete');
            router.post(route('orders.complete', ord.id), {}, {
                onFinish: () => setProcessingAction(null),
            });
        }
    };

    const handleCancel = () => {
        if (confirm('Yakin ingin membatalkan pesanan ini? Aksi pembatalan bersifat permanen.')) {
            setProcessingAction('cancel');
            router.post(route('orders.cancel', ord.id), {}, {
                onFinish: () => setProcessingAction(null),
            });
        }
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'selesai':
                return {
                    bg: 'bg-[#DCFCE7] text-[#16A34A]',
                    label: 'Selesai',
                    icon: CheckCircle2,
                };
            case 'dibatalkan':
                return {
                    bg: 'bg-[#FEE2E2] text-[#DC2626]',
                    label: 'Dibatalkan',
                    icon: XCircle,
                };
            default:
                return {
                    bg: 'bg-[#FEF3C7] text-[#D97706]',
                    label: 'Dibuat (Sedang Berjalan)',
                    icon: Clock,
                };
        }
    };

    const statusBadge = getStatusBadge(ord.status);
    const StatusIcon = statusBadge.icon;

    return (
        <AuthenticatedLayout header={`Detail Pesanan: ${ord.order_number}`}>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card & Tombol Status */}
                <div className="bg-white p-6 rounded-xl border border-[#E4E7EF] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-[#242943]">{ord.order_number}</h2>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md ${statusBadge.bg}`}>
                                <StatusIcon size={14} />
                                {statusBadge.label}
                            </span>
                        </div>
                        <p className="text-xs text-[#737B91] mt-1">
                            Dibuat pada: <span className="font-medium text-[#242943]">{ord.created_at}</span> • Staf: <span className="font-medium text-[#242943]">{ord.user?.name || '-'}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {canComplete && (
                            <button
                                onClick={handleComplete}
                                disabled={processingAction !== null}
                                className="inline-flex items-center gap-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                            >
                                <CheckCircle2 size={16} />
                                <span>{processingAction === 'complete' ? 'Memproses...' : 'Selesaikan Pesanan'}</span>
                            </button>
                        )}

                        {canCancel && (
                            <button
                                onClick={handleCancel}
                                disabled={processingAction !== null}
                                className="inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                            >
                                <XCircle size={16} />
                                <span>{processingAction === 'cancel' ? 'Memproses...' : 'Batalkan'}</span>
                            </button>
                        )}

                        <Link
                            href={route('orders.index')}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            <ArrowLeft size={16} />
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* Grid Rincian Reservasi & Meja */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kartu Reservasi */}
                    <div className="bg-white p-5 rounded-xl border border-[#E4E7EF] space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E4E7EF] pb-2">
                            <h3 className="font-bold text-[#242943] text-sm flex items-center gap-2">
                                <Calendar size={16} className="text-[#4361EE]" />
                                <span>Informasi Reservasi Meja</span>
                            </h3>
                            {ord.reservation?.id && (
                                <Link
                                    href={route('reservations.show', ord.reservation.id)}
                                    className="text-xs text-[#4361EE] hover:text-[#3A53D0] font-semibold inline-flex items-center gap-1"
                                >
                                    Lihat Reservasi <ExternalLink size={12} />
                                </Link>
                            )}
                        </div>
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <dt className="text-[#737B91]">Kode Reservasi</dt>
                                <dd className="font-bold text-[#242943] text-sm">{ord.reservation?.code || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-[#737B91]">Meja Restoran</dt>
                                <dd className="font-bold text-[#4361EE] text-sm">
                                    Meja {ord.reservation?.restaurant_table?.code || '-'} ({ord.reservation?.restaurant_table?.location || '-'})
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Kartu Pelanggan */}
                    <div className="bg-white p-5 rounded-xl border border-[#E4E7EF] space-y-3">
                        <div className="flex items-center gap-2 border-b border-[#E4E7EF] pb-2">
                            <User size={16} className="text-[#FF9F1C]" />
                            <h3 className="font-bold text-[#242943] text-sm">Informasi Pelanggan</h3>
                        </div>
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <dt className="text-[#737B91]">Nama Pelanggan</dt>
                                <dd className="font-bold text-[#242943] text-sm">{ord.reservation?.customer?.name || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-[#737B91]">Nomor Telepon</dt>
                                <dd className="font-medium text-[#737B91]">{ord.reservation?.customer?.phone || '-'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Struk Rincian Item Pesanan */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden">
                    <div className="p-5 border-b border-[#E4E7EF] flex items-center gap-2">
                        <Utensils size={18} className="text-[#2EC4B6]" />
                        <h3 className="font-bold text-[#242943] text-base">Rincian Menu yang Dipesan</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                    <th className="p-4 font-semibold">Nama Menu & Catatan</th>
                                    <th className="p-4 font-semibold text-right">Harga Satuan</th>
                                    <th className="p-4 font-semibold text-center">Qty</th>
                                    <th className="p-4 font-semibold text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4E7EF]">
                                {ord.items && ord.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#F7F8FC] transition">
                                        <td className="p-4">
                                            <div className="font-semibold text-[#242943]">
                                                {item.menu_name || `Menu #${item.menu_id}`}
                                            </div>
                                            {item.note && (
                                                <div className="text-xs text-[#D97706] italic mt-0.5">
                                                    Catatan: {item.note}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right text-[#737B91]">
                                            Rp {Number(item.price_at_order).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-4 text-center font-bold text-[#242943]">
                                            {item.qty}
                                        </td>
                                        <td className="p-4 text-right font-semibold text-[#242943]">
                                            Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Ringkasan Finansial Tagihan */}
                    <div className="p-5 bg-[#F7F8FC] border-t border-[#E4E7EF]">
                        <div className="max-w-xs ml-auto space-y-2 text-xs">
                            <div className="flex justify-between text-[#737B91]">
                                <span>Subtotal Menu</span>
                                <span className="font-medium text-[#242943]">
                                    Rp {Number(ord.subtotal).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between text-[#737B91]">
                                <span>Pajak Restoran</span>
                                <span className="font-medium text-[#242943]">
                                    Rp {Number(ord.tax).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between text-[#737B91]">
                                <span>Biaya Layanan</span>
                                <span className="font-medium text-[#242943]">
                                    Rp {Number(ord.service_charge).toLocaleString('id-ID')}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-[#242943] pt-2 border-t border-[#E4E7EF]">
                                <span>Total Tagihan</span>
                                <span className="text-[#4361EE]">
                                    Rp {Number(ord.total).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

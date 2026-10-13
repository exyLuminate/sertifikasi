import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    Armchair,
    MapPin,
    FileDown,
    ArrowLeft,
    CheckCircle2,
    Check,
    XCircle,
    X,
    AlertTriangle,
    Utensils,
    Plus,
    ExternalLink,
    Info,
} from 'lucide-react';

/**
 * Reservations/Show.jsx — Halaman detail reservasi meja (Unit 4, 6 & Phase 4).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, no emojis.
 */
export default function Show({ reservation, actions = [] }) {
    const res = reservation?.data || reservation;
    const [processingAction, setProcessingAction] = useState(null);

    const orders = res.orders || [];
    const hasOrders = orders.length > 0;
    const hasUnfinishedOrders = orders.some((o) => o.status === 'dibuat');

    const handleConfirm = () => {
        if (confirm('Konfirmasi reservasi ini? Status akan berubah menjadi Dikonfirmasi.')) {
            setProcessingAction('confirm');
            router.post(route('reservations.confirm', res.id), {}, {
                onFinish: () => setProcessingAction(null),
            });
        }
    };

    const handleComplete = () => {
        if (!hasOrders) {
            alert('Reservasi ini belum memiliki pesanan menu. Silakan tambahkan pesanan terlebih dahulu, atau pilih "Batalkan" jika tamu tidak jadi memesan/makan.');
            return;
        }

        if (hasUnfinishedOrders) {
            alert('Masih terdapat pesanan aktif yang belum diselesaikan (status masih Dibuat). Harap selesaikan atau batalkan pesanan tersebut terlebih dahulu.');
            return;
        }

        if (confirm('Selesaikan reservasi ini? Pastikan pelanggan telah selesai menggunakan meja dan semua pesanan telah dituntaskan.')) {
            setProcessingAction('complete');
            router.post(route('reservations.complete', res.id), {}, {
                onFinish: () => setProcessingAction(null),
            });
        }
    };

    const handleCancel = () => {
        if (confirm('Yakin ingin membatalkan reservasi ini? PERINGATAN: Semua pesanan aktif yang belum selesai juga akan otomatis dibatalkan.')) {
            setProcessingAction('cancel');
            router.post(route('reservations.cancel', res.id), {}, {
                onFinish: () => setProcessingAction(null),
            });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'dikonfirmasi':
                return {
                    bg: 'bg-[#DBEAFE] text-[#2563EB]',
                    label: 'Dikonfirmasi',
                    icon: Check,
                };
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
                    label: 'Dipesan (Menunggu Konfirmasi)',
                    icon: Clock,
                };
        }
    };

    const statusBadge = getStatusBadge(res.status);
    const StatusIcon = statusBadge.icon;

    return (
        <AuthenticatedLayout header={`Detail Reservasi: ${res.code}`}>
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Card & Status Bar */}
                <div className="bg-white p-6 rounded-xl border border-[#E4E7EF] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-[#242943]">{res.code}</h2>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md ${statusBadge.bg}`}>
                                <StatusIcon size={14} />
                                {statusBadge.label}
                            </span>
                        </div>
                        <p className="text-xs text-[#737B91] mt-1">
                            Dibuat oleh staf/admin: <span className="font-medium text-[#242943]">{res.user?.name || '-'}</span>
                        </p>
                    </div>

                    {/* Tombol Aksi Transisi Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        {actions.includes('confirm') && (
                            <button
                                onClick={handleConfirm}
                                disabled={processingAction !== null}
                                className="inline-flex items-center gap-1.5 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                                <Check size={16} />
                                <span>{processingAction === 'confirm' ? 'Memproses...' : 'Konfirmasi'}</span>
                            </button>
                        )}

                        {actions.includes('complete') && (
                            <button
                                onClick={handleComplete}
                                disabled={processingAction !== null || !hasOrders}
                                title={!hasOrders ? 'Tambahkan pesanan terlebih dahulu sebelum menyelesaikan reservasi, atau pilih Batalkan jika tamu tidak memesan.' : ''}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    !hasOrders
                                        ? 'bg-[#F7F8FC] text-[#737B91] cursor-not-allowed border border-[#E4E7EF]'
                                        : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                                }`}
                            >
                                <CheckCircle2 size={16} />
                                <span>{processingAction === 'complete' ? 'Memproses...' : 'Selesaikan'}</span>
                            </button>
                        )}

                        {actions.includes('cancel') && (
                            <button
                                onClick={handleCancel}
                                disabled={processingAction !== null}
                                className="inline-flex items-center gap-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                                <X size={16} />
                                <span>{processingAction === 'cancel' ? 'Memproses...' : 'Batalkan'}</span>
                            </button>
                        )}

                        <a
                            href={route('reservations.pdf', res.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#242943] border border-[#E4E7EF] px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            <FileDown size={16} className="text-[#4361EE]" />
                            <span>Unduh Bukti PDF</span>
                        </a>

                        <Link
                            href={route('reservations.index')}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] px-4 py-2 rounded-lg text-sm font-medium transition"
                        >
                            <ArrowLeft size={16} />
                            <span>Kembali</span>
                        </Link>
                    </div>
                </div>

                {/* Banner Peringatan jika belum ada pesanan atau ada pesanan yang masih menggantung */}
                {actions.includes('complete') && !hasOrders && (
                    <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 text-xs sm:text-sm text-[#92400E] flex items-start gap-3">
                        <AlertTriangle size={20} className="text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Tombol "Selesaikan" dinonaktifkan karena belum ada pesanan menu.</p>
                            <p className="text-[#B45309] mt-0.5">
                                Pelanggan wajib memiliki minimal 1 pesanan sebelum reservasi dapat diselesaikan. Gunakan tombol <span className="font-semibold text-[#4361EE]">+ Buat Pesanan</span> di tabel bawah, atau pilih tombol <span className="font-semibold text-[#DC2626]">Batalkan</span> jika tamu tidak jadi makan / batal datang.
                            </p>
                        </div>
                    </div>
                )}

                {actions.includes('complete') && hasOrders && hasUnfinishedOrders && (
                    <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-xl p-4 text-xs sm:text-sm text-[#1E40AF] flex items-start gap-3">
                        <Clock size={20} className="text-[#2563EB] shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Masih terdapat pesanan aktif yang belum selesai.</p>
                            <p className="text-[#1D4ED8] mt-0.5">
                                Selesaikan pembayaran pesanan yang masih berstatus <span className="font-semibold">Dibuat</span> sebelum menyelesaikan reservasi meja ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Grid Rincian Informasi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Informasi Jadwal & Tamu */}
                    <div className="bg-white p-6 rounded-xl border border-[#E4E7EF]">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E4E7EF]">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                                <Calendar size={18} />
                            </div>
                            <h3 className="font-semibold text-[#242943]">Jadwal & Tamu</h3>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-[#737B91]">Waktu Kedatangan</dt>
                                <dd className="font-semibold text-[#242943] text-base">{res.start_at}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Perkiraan Selesai (Durasi 2 Jam)</dt>
                                <dd className="font-medium text-[#242943]">{res.end_at}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Jumlah Tamu</dt>
                                <dd className="font-medium text-[#242943]">
                                    <span className="inline-flex items-center gap-1.5 bg-[#F7F8FC] border border-[#E4E7EF] px-2.5 py-0.5 rounded-md text-[#242943] font-semibold text-xs">
                                        <User size={13} className="text-[#4361EE]" />
                                        {res.guest_count} Orang
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Catatan Khusus</dt>
                                <dd className="text-[#737B91] italic bg-[#F7F8FC] p-2.5 rounded-lg border border-[#E4E7EF] mt-1 text-xs">
                                    {res.note || 'Tidak ada catatan.'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* 2. Informasi Pelanggan */}
                    <div className="bg-white p-6 rounded-xl border border-[#E4E7EF]">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E7EF]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#FF9F1C] flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <h3 className="font-semibold text-[#242943]">Pelanggan</h3>
                            </div>
                            {res.customer?.id && (
                                <Link
                                    href={route('customers.show', res.customer.id)}
                                    className="text-xs text-[#4361EE] hover:text-[#3A53D0] font-medium inline-flex items-center gap-1"
                                >
                                    Detail <ExternalLink size={12} />
                                </Link>
                            )}
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-[#737B91]">Nama Pelanggan</dt>
                                <dd className="font-semibold text-[#242943] text-base">{res.customer?.name || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Nomor Telepon</dt>
                                <dd className="font-medium text-[#242943]">
                                    {res.customer?.phone ? (
                                        <a href={`tel:${res.customer.phone}`} className="text-[#4361EE] hover:underline inline-flex items-center gap-1.5">
                                            <Phone size={14} />
                                            {res.customer.phone}
                                        </a>
                                    ) : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Email</dt>
                                <dd className="font-medium text-[#737B91] inline-flex items-center gap-1.5">
                                    <Mail size={14} className="text-[#737B91]" />
                                    {res.customer?.email || '-'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* 3. Informasi Meja Restoran */}
                    <div className="bg-white p-6 rounded-xl border border-[#E4E7EF]">
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E4E7EF]">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#B8B8FF] flex items-center justify-center">
                                <Armchair size={18} className="text-[#4361EE]" />
                            </div>
                            <h3 className="font-semibold text-[#242943]">Meja Restoran</h3>
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-xs text-[#737B91]">Nomor / Kode Meja</dt>
                                <dd className="font-bold text-[#4361EE] text-xl">
                                    {res.restaurant_table?.code || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Kapasitas Maksimal</dt>
                                <dd className="font-medium text-[#242943]">
                                    {res.restaurant_table?.capacity ? `${res.restaurant_table.capacity} Orang` : '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#737B91]">Lokasi / Area</dt>
                                <dd className="capitalize font-medium text-[#242943]">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F7F8FC] border border-[#E4E7EF] text-[#242943] text-xs">
                                        <MapPin size={12} className="text-[#2EC4B6]" />
                                        {res.restaurant_table?.location || '-'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Section Riwayat Pesanan (Phase 5 Integration) */}
                <div className="bg-white p-6 rounded-xl border border-[#E4E7EF]">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E7EF]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#E6FFFA] text-[#2EC4B6] flex items-center justify-center">
                                <Utensils size={18} />
                            </div>
                            <h3 className="font-semibold text-[#242943]">Daftar Pesanan Meja</h3>
                        </div>
                        {res.status === 'dikonfirmasi' && (
                            <Link
                                href={route('orders.create', { reservation: res.id })}
                                className="inline-flex items-center gap-1.5 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
                            >
                                <Plus size={14} />
                                <span>Buat Pesanan</span>
                            </Link>
                        )}
                    </div>

                    {res.orders && res.orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                        <th className="p-3 font-semibold">Nomor Pesanan</th>
                                        <th className="p-3 font-semibold">Status</th>
                                        <th className="p-3 font-semibold">Total</th>
                                        <th className="p-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E7EF]">
                                    {res.orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-[#F7F8FC] transition">
                                            <td className="p-3 font-medium text-[#4361EE]">{order.order_number || order.code}</td>
                                            <td className="p-3 capitalize">
                                                <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md font-semibold ${
                                                    order.status === 'selesai' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                                                    order.status === 'dibatalkan' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                                                    'bg-[#FEF3C7] text-[#D97706]'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-medium text-[#242943]">Rp {Number(order.total || 0).toLocaleString('id-ID')}</td>
                                            <td className="p-3 text-right">
                                                <Link href={`/orders/${order.id}`} className="text-[#4361EE] hover:underline inline-flex items-center gap-1 text-xs font-medium">
                                                    Lihat Pesanan <ExternalLink size={12} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-[#737B91] text-sm">
                            <p>Belum ada pesanan untuk reservasi ini.</p>
                            {res.status === 'dipesan' && (
                                <p className="text-xs text-[#D97706] mt-1 inline-flex items-center gap-1 justify-center">
                                    <Info size={14} />
                                    Pesanan dapat dibuat setelah reservasi dikonfirmasi oleh staf.
                                </p>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

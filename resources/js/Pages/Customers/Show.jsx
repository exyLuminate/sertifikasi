import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    User,
    Phone,
    Mail,
    FileText,
    Pencil,
    ArrowLeft,
    Calendar,
    Armchair,
} from 'lucide-react';

/**
 * Customers/Show.jsx — Detail pelanggan & riwayat reservasi (Unit 6).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Show({ customer }) {
    if (!customer) return null;

    const getStatusBadge = (resStatus) => {
        switch (resStatus) {
            case 'dikonfirmasi':
                return 'bg-[#DBEAFE] text-[#2563EB]';
            case 'selesai':
                return 'bg-[#DCFCE7] text-[#16A34A]';
            case 'dibatalkan':
                return 'bg-[#FEE2E2] text-[#DC2626]';
            default:
                return 'bg-[#FEF3C7] text-[#D97706]';
        }
    };

    return (
        <AuthenticatedLayout header={`Detail Pelanggan: ${customer.name}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Informasi Dasar Pelanggan */}
                <div className="bg-white p-6 rounded-xl border border-[#E4E7EF]">
                    <div className="flex items-center justify-between border-b border-[#E4E7EF] pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#4361EE] text-white flex items-center justify-center font-bold text-lg">
                                {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#242943]">{customer.name}</h3>
                                <p className="text-xs text-[#737B91]">ID Pelanggan: #{customer.id}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={route('customers.edit', customer.id)}
                                className="inline-flex items-center gap-1.5 bg-[#FF9F1C] hover:bg-[#E08A10] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                            >
                                <Pencil size={14} />
                                <span>Edit</span>
                            </Link>
                            <Link
                                href={route('customers.index')}
                                className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                <ArrowLeft size={14} />
                                <span>Kembali</span>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E4E7EF]">
                            <span className="text-xs text-[#737B91] block mb-1">Nomor Telepon</span>
                            <span className="font-semibold text-[#242943] inline-flex items-center gap-1.5">
                                <Phone size={14} className="text-[#4361EE]" />
                                {customer.phone}
                            </span>
                        </div>
                        <div className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E4E7EF]">
                            <span className="text-xs text-[#737B91] block mb-1">Email</span>
                            <span className="font-semibold text-[#242943] inline-flex items-center gap-1.5">
                                <Mail size={14} className="text-[#737B91]" />
                                {customer.email || '-'}
                            </span>
                        </div>
                        <div className="md:col-span-2 p-3 bg-[#F7F8FC] rounded-lg border border-[#E4E7EF]">
                            <span className="text-xs text-[#737B91] block mb-1">Catatan Tambahan (Preferensi / Alergi)</span>
                            <span className="font-medium text-[#242943]">
                                {customer.notes || 'Tidak ada catatan.'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Riwayat Reservasi (Unit 6: Eager Loading Data) */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden">
                    <div className="p-5 border-b border-[#E4E7EF] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-[#4361EE]" />
                            <h3 className="font-bold text-[#242943] text-base">Riwayat Reservasi</h3>
                        </div>
                        <span className="bg-[#EEF2FF] text-[#4361EE] text-xs px-2.5 py-0.5 rounded-md font-semibold">
                            {customer.reservations?.length || 0} Reservasi
                        </span>
                    </div>

                    {customer.reservations && customer.reservations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                        <th className="p-4 font-semibold">Kode Reservasi</th>
                                        <th className="p-4 font-semibold">Waktu Mulai</th>
                                        <th className="p-4 font-semibold">Meja</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E4E7EF]">
                                    {customer.reservations.map((res) => (
                                        <tr key={res.id} className="hover:bg-[#F7F8FC] transition">
                                            <td className="p-4 font-bold text-[#4361EE]">{res.code}</td>
                                            <td className="p-4 text-[#242943]">{res.start_at}</td>
                                            <td className="p-4 text-[#242943] font-medium">Meja {res.restaurant_table?.code || '-'}</td>
                                            <td className="p-4 capitalize">
                                                <span className={`inline-block px-2.5 py-0.5 text-xs rounded-md font-semibold ${getStatusBadge(res.status)}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={route('reservations.show', res.id)}
                                                    className="text-xs text-[#4361EE] hover:underline font-semibold"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-[#737B91] text-sm">
                            Belum ada riwayat reservasi untuk pelanggan ini.
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
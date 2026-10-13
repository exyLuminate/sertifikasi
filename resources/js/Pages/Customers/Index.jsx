import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    Users,
} from 'lucide-react';

/**
 * Customers/Index.jsx — Halaman daftar pelanggan.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Index({ customers, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    // Kirim pencarian ke server saat user mengetik
    const handleSearch = (value) => {
        setSearch(value);
        router.get(route('customers.index'), { search: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (customer) => {
        if (!confirm(`Hapus pelanggan "${customer.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(route('customers.destroy', customer.id));
    };

    const meta = customers?.meta ?? customers;
    const customerList = customers?.data || [];
    const paginationLinks = meta?.links ?? [];

    return (
        <AuthenticatedLayout header="Manajemen Pelanggan">
            <Head title="Pelanggan" />

            <div className="space-y-4">
                {/* Toolbar: search + tombol tambah */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                    <div className="relative w-full sm:w-80">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737B91]" />
                        <input
                            type="text"
                            placeholder="Cari nama atau telepon..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 w-full px-3 py-2 border border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                        />
                    </div>
                    <Link
                        href={route('customers.create')}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white text-sm font-semibold rounded-lg transition"
                    >
                        <Plus size={16} />
                        <span>Tambah Pelanggan</span>
                    </Link>
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                    <th className="p-4 font-semibold">#</th>
                                    <th className="p-4 font-semibold">Nama</th>
                                    <th className="p-4 font-semibold">Telepon</th>
                                    <th className="p-4 font-semibold">Email</th>
                                    <th className="p-4 font-semibold text-center">Reservasi</th>
                                    <th className="p-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4E7EF]">
                                {customerList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[#737B91] text-sm">
                                            Tidak ada data pelanggan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    customerList.map((customer, idx) => (
                                        <tr key={customer.id} className="hover:bg-[#F7F8FC] transition">
                                            <td className="p-4 text-[#737B91]">
                                                {((meta.current_page || 1) - 1) * (meta.per_page || 15) + idx + 1}
                                            </td>
                                            <td className="p-4 font-medium text-[#242943]">
                                                <Link
                                                    href={route('customers.show', customer.id)}
                                                    className="text-[#4361EE] hover:underline"
                                                >
                                                    {customer.name}
                                                </Link>
                                            </td>
                                            <td className="p-4 text-[#242943]">{customer.phone}</td>
                                            <td className="p-4 text-[#737B91]">{customer.email ?? '-'}</td>
                                            <td className="p-4 text-center">
                                                <span className="inline-block px-2.5 py-0.5 bg-[#EEF2FF] text-[#4361EE] rounded-md text-xs font-semibold">
                                                    {customer.reservations_count}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                <Link
                                                    href={route('customers.show', customer.id)}
                                                    className="inline-flex items-center gap-1 text-xs text-[#737B91] hover:text-[#242943] font-medium"
                                                >
                                                    <Eye size={13} />
                                                    <span>Lihat</span>
                                                </Link>
                                                <Link
                                                    href={route('customers.edit', customer.id)}
                                                    className="inline-flex items-center gap-1 text-xs text-[#FF9F1C] hover:text-[#D97706] font-medium ml-2"
                                                >
                                                    <Pencil size={13} />
                                                    <span>Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(customer)}
                                                    className="inline-flex items-center gap-1 text-xs text-[#DC2626] hover:text-[#B91C1C] font-medium ml-2"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Hapus</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginasi */}
                    {paginationLinks.length > 3 && (
                        <div className="p-4 border-t border-[#E4E7EF] flex items-center justify-between">
                            <span className="text-xs text-[#737B91]">
                                Menampilkan {customerList.length} pelanggan
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

import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Tags,
} from 'lucide-react';

/**
 * Admin/MenuCategories/Index.jsx — Manajemen Kategori Menu.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Index({ categories, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('menu-categories.index'), { search }, { preserveState: true });
    };

    const handleDelete = (id, name) => {
        if (confirm(`Yakin ingin menghapus kategori "${name}"? Kategori tidak bisa dihapus jika masih ada menu di dalamnya.`)) {
            router.delete(route('menu-categories.destroy', id));
        }
    };

    const categoryList = categories?.data || [];
    const paginationLinks = categories?.meta?.links || [];

    return (
        <AuthenticatedLayout header="Manajemen Kategori Menu">
            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737B91]" />
                            <input
                                type="text"
                                placeholder="Cari nama kategori..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full px-3 py-2 border border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#4361EE] hover:bg-[#3A53D0] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            Cari
                        </button>
                    </form>

                    <Link
                        href={route('menu-categories.create')}
                        className="inline-flex items-center justify-center gap-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                        <Plus size={16} />
                        <span>Tambah Kategori</span>
                    </Link>
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-xl border border-[#E4E7EF] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-[#F7F8FC] border-b border-[#E4E7EF] text-[#737B91] text-xs">
                                    <th className="p-4 font-semibold">Nama Kategori</th>
                                    <th className="p-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E4E7EF]">
                                {categoryList.length === 0 ? (
                                    <tr>
                                        <td colSpan="2" className="p-8 text-center text-[#737B91] text-sm">
                                            Tidak ada data kategori.
                                        </td>
                                    </tr>
                                ) : (
                                    categoryList.map((category) => (
                                        <tr key={category.id} className="hover:bg-[#F7F8FC] transition">
                                            <td className="p-4 font-semibold text-[#242943] text-base flex items-center gap-2">
                                                <Tags size={16} className="text-[#4361EE]" />
                                                <span>{category.name}</span>
                                            </td>
                                            <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                                <Link
                                                    href={route('menu-categories.edit', category.id)}
                                                    className="inline-flex items-center gap-1 text-xs text-[#FF9F1C] hover:text-[#D97706] font-medium"
                                                >
                                                    <Pencil size={13} />
                                                    <span>Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
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

                    {paginationLinks.length > 3 && (
                        <div className="p-4 border-t border-[#E4E7EF] flex items-center justify-between">
                            <span className="text-xs text-[#737B91]">
                                Menampilkan {categoryList.length} kategori
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
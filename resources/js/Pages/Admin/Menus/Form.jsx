import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

/**
 * Admin/Menus/Form.jsx — Form tambah/edit menu restoran.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, no emojis.
 */
export default function Form({ menuData, categories, isEdit }) {
    const { data, setData, post, put, errors, processing } = useForm({
        menu_category_id: menuData?.menu_category_id || '',
        name: menuData?.name || '',
        description: menuData?.description || '',
        price: menuData?.price || '',
        is_available: menuData?.is_available ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('menus.update', menuData.id));
        } else {
            post(route('menus.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Menu' : 'Tambah Menu'}>
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Kategori Menu <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                            value={data.menu_category_id}
                            onChange={(e) => setData('menu_category_id', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            required
                        >
                            <option value="" disabled>-- Pilih Kategori --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.menu_category_id && <div className="text-[#DC2626] text-xs mt-1">{errors.menu_category_id}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Nama Menu <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: Nasi Goreng Spesial"
                            required
                        />
                        {errors.name && <div className="text-[#DC2626] text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Harga Satuan (Rp) <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="35000"
                            required
                        />
                        {errors.price && <div className="text-[#DC2626] text-xs mt-1">{errors.price}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Deskripsi Menu (Opsional)
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            rows="3"
                            placeholder="Penjelasan bahan, porsi, atau rasa makanan..."
                        ></textarea>
                        {errors.description && <div className="text-[#DC2626] text-xs mt-1">{errors.description}</div>}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_available"
                            checked={data.is_available}
                            onChange={(e) => setData('is_available', e.target.checked)}
                            className="rounded border-[#E4E7EF] text-[#4361EE] focus:ring-[#4361EE]"
                        />
                        <label htmlFor="is_available" className="text-sm font-medium text-[#242943] cursor-pointer">
                            Menu Tersedia (Dapat Dipesan Tamu)
                        </label>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#E4E7EF]">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] px-5 py-2.5 rounded-lg text-sm font-medium transition"
                        >
                            <ArrowLeft size={16} />
                            <span>Batal</span>
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                        >
                            <CheckCircle2 size={16} />
                            <span>{processing ? 'Menyimpan...' : 'Simpan Data'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
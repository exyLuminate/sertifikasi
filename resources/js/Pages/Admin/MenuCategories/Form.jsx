import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

/**
 * Admin/MenuCategories/Form.jsx — Form tambah/edit kategori menu.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, no emojis.
 */
export default function Form({ categoryData, isEdit }) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: categoryData?.name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('menu-categories.update', categoryData.id));
        } else {
            post(route('menu-categories.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Kategori Menu' : 'Tambah Kategori Menu'}>
            <div className="max-w-xl bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Nama Kategori <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: Makanan Utama, Minuman, Dessert..."
                            required
                        />
                        {errors.name && <div className="text-[#DC2626] text-xs mt-1">{errors.name}</div>}
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
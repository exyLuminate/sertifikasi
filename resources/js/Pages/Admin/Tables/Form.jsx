import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

/**
 * Admin/Tables/Form.jsx — Form tambah/edit meja restoran.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, no emojis.
 */
export default function Form({ tableData, isEdit }) {
    const { data, setData, post, put, errors, processing } = useForm({
        code: tableData?.code || '',
        capacity: tableData?.capacity || 2,
        location: tableData?.location || 'indoor',
        is_active: tableData?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('tables.update', tableData.id));
        } else {
            post(route('tables.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Meja' : 'Tambah Meja'}>
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Kode Meja (Contoh: T01) <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] uppercase focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="T01"
                            required
                        />
                        {errors.code && <div className="text-[#DC2626] text-xs mt-1">{errors.code}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Kapasitas Maksimal (Orang) <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            required
                        />
                        {errors.capacity && <div className="text-[#DC2626] text-xs mt-1">{errors.capacity}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Lokasi / Area <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                        >
                            <option value="indoor">Indoor (Dalam Ruangan)</option>
                            <option value="outdoor">Outdoor (Luar Ruangan)</option>
                            <option value="vip">VIP (Ruang Khusus)</option>
                        </select>
                        {errors.location && <div className="text-[#DC2626] text-xs mt-1">{errors.location}</div>}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-[#E4E7EF] text-[#4361EE] focus:ring-[#4361EE]"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-[#242943] cursor-pointer">
                            Meja Aktif (Dapat Dipesan / Tersedia di Sistem)
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
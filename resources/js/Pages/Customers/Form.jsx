import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

/**
 * Customers/Form.jsx — Form tambah/edit pelanggan.
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, no emojis.
 */
export default function Form({ customer, isEdit }) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: customer?.name || '',
        phone: customer?.phone || '',
        email: customer?.email || '',
        notes: customer?.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('customers.update', customer.id));
        } else {
            post(route('customers.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan'}>
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Nama Pelanggan <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                        {errors.name && <div className="text-[#DC2626] text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Nomor Telepon <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: 08123456789"
                            required
                        />
                        {errors.phone && <div className="text-[#DC2626] text-xs mt-1">{errors.phone}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Email (Opsional)
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: budi@example.com"
                        />
                        {errors.email && <div className="text-[#DC2626] text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Catatan Tambahan (Alergi, Preferensi Meja, dll)
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            rows="3"
                            placeholder="Catatan preferensi pelanggan..."
                        ></textarea>
                        {errors.notes && <div className="text-[#DC2626] text-xs mt-1">{errors.notes}</div>}
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
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

/**
 * Admin/Users/Form.jsx — Form tambah/edit pengguna & role (Admin).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, no emojis.
 */
export default function Form({ userData, isEdit }) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: userData?.name || '',
        email: userData?.email || '',
        password: '',
        password_confirmation: '',
        role: userData?.role || 'staf',
        is_active: userData?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('users.update', userData.id));
        } else {
            post(route('users.store'));
        }
    };

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Pengguna' : 'Tambah Pengguna'}>
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF]">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Nama Lengkap <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: Siti Rahma"
                            required
                        />
                        {errors.name && <div className="text-[#DC2626] text-xs mt-1">{errors.name}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Email <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            placeholder="Contoh: siti@restoran.test"
                            required
                        />
                        {errors.email && <div className="text-[#DC2626] text-xs mt-1">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Password {isEdit ? <span className="text-[#737B91] font-normal text-xs">(Kosongkan jika tidak ingin mengubah password)</span> : <span className="text-[#DC2626]">*</span>}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            required={!isEdit}
                        />
                        {errors.password && <div className="text-[#DC2626] text-xs mt-1">{errors.password}</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Konfirmasi Password {isEdit ? <span className="text-[#737B91] font-normal text-xs">(Kosongkan jika tidak mengubah password)</span> : <span className="text-[#DC2626]">*</span>}
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            required={!isEdit && !!data.password}
                        />
                        {errors.password_confirmation && (
                            <div className="text-[#DC2626] text-xs mt-1">{errors.password_confirmation}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Role / Peran <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                            required
                        >
                            <option value="staf">Staf (Kasir / Pelayan)</option>
                            <option value="admin">Administrator</option>
                        </select>
                        {errors.role && <div className="text-[#DC2626] text-xs mt-1">{errors.role}</div>}
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
                            Akun Aktif (Dapat Login ke Sistem)
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
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { LogIn, KeyRound, Mail, UserCheck } from 'lucide-react';

/**
 * Halaman Login — Colorful Flat Design (design-system.md).
 * Dilengkapi tombol cepat akun demo untuk mempermudah demonstrasi asesor LSP.
 */
export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemo = (email) => {
        setData((prev) => ({
            ...prev,
            email,
            password: 'password',
        }));
    };

    return (
        <GuestLayout>
            <Head title="Masuk ke Akun" />

            <div className="mb-6 text-center">
                <h2 className="text-lg font-bold text-[#242943]">Masuk ke Sistem</h2>
                <p className="text-xs text-[#737B91] mt-1">Masukkan email dan kata sandi Anda</p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-lg text-xs font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B91]">
                            <Mail size={16} />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-9"
                            placeholder="nama@restoran.test"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B91]">
                            <KeyRound size={16} />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full pl-9"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded text-[#4361EE] focus:ring-[#4361EE]"
                        />
                        <span className="text-xs text-[#737B91]">Ingat saya</span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full py-2.5 text-sm" disabled={processing}>
                        <LogIn size={16} />
                        <span>{processing ? 'Memproses Masuk...' : 'Masuk ke Sistem'}</span>
                    </PrimaryButton>
                </div>
            </form>

            {/* Kotak Akun Demo (Praktis untuk Ujian LSP) */}
            <div className="mt-6 pt-5 border-t border-[#E4E7EF]">
                <div className="flex items-center gap-1.5 mb-2.5 text-[11px] font-bold text-[#737B91] uppercase tracking-wider">
                    <UserCheck size={14} className="text-[#4361EE]" />
                    <span>Akun Demo (Klik untuk Isi):</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => fillDemo('admin@resto.com')}
                        className="p-2 rounded-lg border border-[#E4E7EF] bg-[#F7F8FC] hover:bg-[#EEF2FF] hover:border-[#4361EE] text-left transition-colors"
                    >
                        <div className="font-bold text-[#242943]">Akun Admin</div>
                        <div className="text-[10px] text-[#737B91]">admin@resto.com</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemo('staf@resto.com')}
                        className="p-2 rounded-lg border border-[#E4E7EF] bg-[#F7F8FC] hover:bg-[#EEF2FF] hover:border-[#4361EE] text-left transition-colors"
                    >
                        <div className="font-bold text-[#242943]">Akun Staff</div>
                        <div className="text-[10px] text-[#737B91]">staf@resto.com</div>
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}

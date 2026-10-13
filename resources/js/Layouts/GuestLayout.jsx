import { UtensilsCrossed } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F8FC] px-4 py-8">
            {/* Header Logo & Title */}
            <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#4361EE] text-white flex items-center justify-center mb-3">
                    <UtensilsCrossed size={26} strokeWidth={2.2} />
                </div>
                <h1 className="text-xl font-bold text-[#242943] tracking-tight">Sistem Pemesanan Restoran</h1>
                <p className="text-xs text-[#737B91] mt-0.5">Aplikasi Kasir &amp; Manajemen Reservasi</p>
            </div>

            {/* Centered Flat Card */}
            <div className="w-full sm:max-w-md bg-white border border-[#E4E7EF] rounded-2xl p-6 sm:p-8">
                {children}
            </div>

            {/* Footer note */}
            <div className="mt-8 text-xs text-[#737B91] text-center">
                &copy; {new Date().getFullYear()} Sistem Restoran • Sertifikasi Kompetensi Programmer
            </div>
        </div>
    );
}

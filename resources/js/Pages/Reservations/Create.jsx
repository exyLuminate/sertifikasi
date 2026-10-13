import { useState, useMemo } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Info,
    Phone,
    X,
    Zap,
    Clock,
    Search,
    AlertTriangle,
    Armchair,
    Ban,
    Check,
    CheckCircle2,
    ArrowLeft,
    Plus,
} from 'lucide-react';

/**
 * Reservations/Create.jsx — Halaman pembuatan reservasi meja (Unit 3, 4, 6 & Phase 4).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Create({ customers = [], availableTables = null, checkError = null, maxTableCapacity = 4, params = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: params?.customer_id || '',
        restaurant_table_id: '',
        start_at: params?.start_at || '',
        guest_count: params?.guest_count ? Number(params.guest_count) : 2,
        note: '',
    });

    const [isChecking, setIsChecking] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    // Deteksi akun Pelanggan Umum / Walk-in jika tersedia di master data
    const umumCustomer = useMemo(() => {
        return customers.find((c) => {
            const name = c.name.toLowerCase();
            return name.includes('pelanggan umum') || name.includes('walk-in') || name.includes('umum');
        }) || null;
    }, [customers]);

    // Pelanggan yang saat ini sedang aktif dipilih
    const selectedCustomer = useMemo(() => {
        if (!data.customer_id) return null;
        return customers.find((c) => String(c.id) === String(data.customer_id)) || null;
    }, [customers, data.customer_id]);

    // Filter daftar pelanggan berdasarkan pencarian nama atau telepon
    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return customers;
        const q = customerSearch.toLowerCase();
        return customers.filter((c) =>
            c.name.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q))
        );
    }, [customers, customerSearch]);

    // Hitung perkiraan jam selesai (+ 2 jam / 120 menit) untuk pratinjau staf
    const estimatedEndTime = useMemo(() => {
        if (!data.start_at) return null;
        try {
            const startDate = new Date(data.start_at);
            if (isNaN(startDate.getTime())) return null;
            const endDate = new Date(startDate.getTime() + 120 * 60 * 1000);
            return endDate.toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
        } catch {
            return null;
        }
    }, [data.start_at]);

    // Panggil server untuk memeriksa meja yang tersedia
    const handleCheckAvailability = () => {
        if (!data.start_at) {
            alert('Silakan pilih waktu kedatangan terlebih dahulu.');
            return;
        }
        if (!data.guest_count || data.guest_count < 1) {
            alert('Jumlah tamu minimal 1 orang.');
            return;
        }

        setIsChecking(true);
        router.get(
            route('reservations.create'),
            {
                start_at: data.start_at,
                guest_count: data.guest_count,
                customer_id: data.customer_id,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsChecking(false),
            }
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('reservations.store'));
    };

    return (
        <AuthenticatedLayout header="Buat Reservasi Baru">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Petunjuk Operasional */}
                <div className="bg-[#EEF2FF] border border-[#C7D2FE] p-4 rounded-xl text-sm text-[#3730A3] flex items-start gap-3">
                    <Info size={20} className="text-[#4361EE] shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-[#1E1B4B]">Ketentuan Reservasi Restoran</h4>
                        <p className="text-[#4338CA] text-xs mt-0.5">
                            Jam operasional: <strong>10:00 s/d 22:00</strong>. Durasi standar reservasi otomatis <strong>2 jam</strong>.
                            Ketersediaan meja dihitung langsung oleh sistem untuk mencegah bentrok jadwal.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-xl border border-[#E4E7EF] space-y-6">

                    {/* Baris 1: Pelanggan */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            <label className="block text-sm font-semibold text-[#242943]">
                                Pelanggan <span className="text-[#DC2626]">*</span>
                            </label>

                            <Link
                                href={route('customers.create')}
                                className="text-xs text-[#4361EE] hover:text-[#3A53D0] font-medium inline-flex items-center gap-1"
                                target="_blank"
                            >
                                <Plus size={13} />
                                <span>Tambah Pelanggan Baru</span>
                            </Link>
                        </div>

                        {selectedCustomer ? (
                            /* Tampilan Kartu Bersih Jika Pelanggan Sudah Dipilih */
                            <div className="flex items-center justify-between p-3.5 bg-[#F7F8FC] border border-[#E4E7EF] rounded-xl transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#4361EE] text-white flex items-center justify-center font-bold text-sm">
                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#242943] text-sm">
                                                {selectedCustomer.name}
                                            </span>
                                            {umumCustomer && String(selectedCustomer.id) === String(umumCustomer.id) && (
                                                <span className="bg-[#FEF3C7] text-[#D97706] text-3xs font-semibold px-2 py-0.5 rounded-md">
                                                    Walk-in
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-[#737B91] font-medium inline-flex items-center gap-1">
                                            <Phone size={12} />
                                            {selectedCustomer.phone || '-'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setData('customer_id', '')}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#737B91] hover:text-[#DC2626] px-3 py-1.5 rounded-lg border border-[#E4E7EF] hover:border-[#FCA5A5] bg-white transition"
                                >
                                    <span>Ganti Pelanggan</span>
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            /* Tampilan Pencarian Jika Pelanggan Belum Dipilih */
                            <div className="space-y-2">
                                {umumCustomer && (
                                    <div className="flex items-center justify-between p-2.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Zap size={16} className="text-[#FF9F1C]" />
                                            <div>
                                                <span className="text-xs font-bold text-[#92400E]">Tamu Datang Langsung (Walk-in)?</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('customer_id', String(umumCustomer.id))}
                                            className="bg-[#FF9F1C] hover:bg-[#E08A10] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                                        >
                                            Pilih "{umumCustomer.name}"
                                        </button>
                                    </div>
                                )}

                                <div className="relative">
                                    <Search size={14} className="absolute inset-y-0 left-3 my-auto text-[#737B91]" />
                                    <input
                                        type="text"
                                        placeholder="Cari & pilih nama atau nomor telepon pelanggan..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="pl-9 w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                    />
                                    {customerSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setCustomerSearch('')}
                                            className="absolute inset-y-0 right-3 flex items-center text-xs text-[#737B91] hover:text-[#242943]"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* List Pelanggan yang Dapat Dipilih */}
                                <div className="max-h-44 overflow-y-auto border border-[#E4E7EF] rounded-xl divide-y divide-[#E4E7EF] bg-white">
                                    {filteredCustomers.length === 0 ? (
                                        <div className="p-3 text-center text-xs text-[#737B91]">
                                            Tidak ada pelanggan yang cocok dengan pencarian "{customerSearch}".
                                        </div>
                                    ) : (
                                        filteredCustomers.slice(0, 6).map((c) => (
                                            <div
                                                key={c.id}
                                                onClick={() => {
                                                    setData('customer_id', String(c.id));
                                                    setCustomerSearch('');
                                                }}
                                                className="p-2.5 hover:bg-[#EEF2FF] cursor-pointer flex items-center justify-between transition text-xs"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-[#242943]">{c.name}</span>
                                                    <span className="text-[#737B91] text-2xs">({c.phone})</span>
                                                </div>
                                                <span className="text-[#4361EE] font-semibold text-xs">Pilih</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {errors.customer_id && (
                            <p className="text-[#DC2626] text-xs mt-1">{errors.customer_id}</p>
                        )}
                    </div>

                    {/* Baris 2: Waktu Mulai & Jumlah Tamu */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-[#F7F8FC] rounded-xl border border-[#E4E7EF]">
                        <div>
                            <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                                Waktu Kedatangan <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={data.start_at}
                                onChange={(e) => {
                                    setData('start_at', e.target.value);
                                    // Reset meja yang dipilih jika waktu kedatangan diganti
                                    setData('restaurant_table_id', '');
                                }}
                                className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                required
                            />
                            {errors.start_at && (
                                <p className="text-[#DC2626] text-xs mt-1.5">{errors.start_at}</p>
                            )}

                            {estimatedEndTime && (
                                <p className="text-xs text-[#737B91] mt-2 flex items-center gap-1.5">
                                    <Clock size={14} className="text-[#4361EE]" />
                                    <span>Perkiraan selesai:</span>
                                    <strong className="text-[#242943]">{estimatedEndTime}</strong>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                                Jumlah Tamu <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={data.guest_count}
                                onChange={(e) => {
                                    setData('guest_count', e.target.value);
                                    setData('restaurant_table_id', '');
                                }}
                                className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                required
                            />
                            {errors.guest_count && (
                                <p className="text-[#DC2626] text-xs mt-1.5">{errors.guest_count}</p>
                            )}
                            <p className="text-xs text-[#737B91] mt-2">
                                Sistem akan menyaring meja dengan kapasitas &ge; {data.guest_count || 1} orang.
                            </p>
                        </div>

                        {/* Tombol Cek Meja Tersedia */}
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCheckAvailability}
                                disabled={isChecking || !data.start_at}
                                className="bg-[#4361EE] hover:bg-[#3A53D0] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition disabled:opacity-50"
                            >
                                {isChecking ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>Memeriksa Meja...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search size={16} />
                                        <span>Cek Meja Tersedia</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Pesan Validasi Cek Ketersediaan Server */}
                    {checkError && (
                        <div className="bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] p-4 rounded-xl text-sm flex items-start gap-2.5">
                            <AlertTriangle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
                            <span>{checkError}</span>
                        </div>
                    )}

                    {/* Baris 3: Pemilihan Meja Tersedia */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-[#242943]">
                            Pilih Meja Restoran <span className="text-[#DC2626]">*</span>
                        </label>

                        {availableTables === null ? (
                            <div className="border border-dashed border-[#E4E7EF] rounded-xl p-6 text-center text-[#737B91] text-sm bg-[#F7F8FC]">
                                <Armchair size={32} className="mx-auto mb-2 text-[#4361EE]" />
                                Isi waktu kedatangan dan jumlah tamu di atas, lalu klik <strong>"Cek Meja Tersedia"</strong> untuk melihat daftar meja yang kosong.
                            </div>
                        ) : availableTables.length === 0 ? (
                            <div className="bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] p-4 rounded-xl text-sm flex items-start gap-3">
                                <Ban size={20} className="text-[#D97706] shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-[#78350F]">Tidak Ada Meja yang Memenuhi Syarat</p>
                                    <p className="text-xs text-[#B45309] mt-1">
                                        {Number(data.guest_count) > maxTableCapacity ? (
                                            <>
                                                Jumlah tamu (<strong>{data.guest_count} orang</strong>) melebihi kapasitas meja terbesar yang ada di restoran (maksimal <strong>{maxTableCapacity} orang per meja</strong>).
                                                Silakan kurangi jumlah tamu atau buat reservasi terpisah untuk beberapa meja.
                                            </>
                                        ) : (
                                            <>
                                                Semua meja dengan kapasitas &ge; {data.guest_count} orang telah terisi/dipesan pada rentang waktu ini.
                                                Silakan coba jam kedatangan lain.
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs text-[#737B91] mb-3">
                                    Ditemukan <strong>{availableTables.length} meja</strong> yang aktif, berkapasitas cukup, dan bebas bentrok jadwal:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {availableTables.map((table) => {
                                        const isSelected = String(data.restaurant_table_id) === String(table.id);
                                        return (
                                            <div
                                                key={table.id}
                                                onClick={() => setData('restaurant_table_id', table.id)}
                                                className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${isSelected
                                                        ? 'border-[#4361EE] bg-[#EEF2FF] ring-2 ring-[#4361EE]'
                                                        : 'border-[#E4E7EF] hover:border-gray-300 bg-white hover:bg-[#F7F8FC]'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold text-[#242943] text-lg">
                                                            {table.code}
                                                        </span>
                                                        <span className="block text-xs text-[#737B91] capitalize">
                                                            Area {table.location}
                                                        </span>
                                                    </div>
                                                    <span className="bg-[#F7F8FC] border border-[#E4E7EF] text-[#242943] text-xs px-2 py-0.5 rounded-md font-medium">
                                                        {table.capacity} Tamu
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <span className={isSelected ? 'text-[#4361EE] font-semibold inline-flex items-center gap-1' : 'text-[#737B91]'}>
                                                        {isSelected ? (
                                                            <>
                                                                <Check size={14} />
                                                                <span>Terpilih</span>
                                                            </>
                                                        ) : (
                                                            'Klik untuk memilih'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {errors.restaurant_table_id && (
                            <p className="text-[#DC2626] text-xs mt-1.5">{errors.restaurant_table_id}</p>
                        )}
                    </div>

                    {/* Baris 4: Catatan Khusus */}
                    <div>
                        <label className="block text-sm font-semibold text-[#242943] mb-1.5">
                            Catatan Khusus (Opsional)
                        </label>
                        <textarea
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            rows="3"
                            placeholder="Contoh: Meja dekat jendela, sediakan 1 kursi bayi (baby chair), alergi kacang..."
                            className="w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                        ></textarea>
                        {errors.note && (
                            <p className="text-[#DC2626] text-xs mt-1.5">{errors.note}</p>
                        )}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E7EF]">
                        <Link
                            href={route('reservations.index')}
                            className="bg-white hover:bg-gray-50 text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] px-5 py-2.5 rounded-lg text-sm font-medium transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !data.restaurant_table_id}
                            className="inline-flex items-center gap-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 size={16} />
                            <span>{processing ? 'Menyimpan Reservasi...' : 'Simpan Reservasi'}</span>
                        </button>
                    </div>

                </form>

            </div>
        </AuthenticatedLayout>
    );
}
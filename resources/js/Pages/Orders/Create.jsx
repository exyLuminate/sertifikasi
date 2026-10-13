import { useState, useMemo } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Search,
    ShoppingCart,
    Utensils,
    X,
    Plus,
    Minus,
    AlertTriangle,
    Trash2,
    CheckCircle2,
    ArrowLeft,
    Check,
} from 'lucide-react';

/**
 * Orders/Create.jsx — Halaman pembuatan pesanan baru (Unit 3, 4, 6 & Phase 5).
 * Colorful Flat Design — Cobalt Blue (#4361EE), border #E4E7EF, Lucide icons, no emojis.
 */
export default function Create({
    reservation = null,
    confirmedReservations = [],
    categories = [],
    taxPercent = 10,
    servicePercent = 5,
}) {
    const { errors = {} } = usePage().props;

    const [selectedReservationId, setSelectedReservationId] = useState(
        reservation?.id ? String(reservation.id) : (confirmedReservations[0]?.id ? String(confirmedReservations[0].id) : '')
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryTab, setActiveCategoryTab] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Keranjang belanja lokal: { [menuId]: { menu, qty, note } }
    const [cart, setCart] = useState({});

    // Cari info reservasi yang sedang aktif dipilih
    const currentReservation = useMemo(() => {
        if (reservation && String(reservation.id) === String(selectedReservationId)) {
            return reservation;
        }
        return confirmedReservations.find((r) => String(r.id) === String(selectedReservationId)) || null;
    }, [reservation, confirmedReservations, selectedReservationId]);

    // Tambah menu ke keranjang
    const addToCart = (menu) => {
        if (!menu.is_available) return;

        setCart((prev) => {
            const existing = prev[menu.id];
            const currentQty = existing ? existing.qty : 0;
            return {
                ...prev,
                [menu.id]: {
                    menu,
                    qty: currentQty + 1,
                    note: existing?.note || '',
                },
            };
        });
    };

    // Kurangi / update qty
    const updateQty = (menuId, newQty) => {
        setCart((prev) => {
            const next = { ...prev };
            if (newQty <= 0) {
                delete next[menuId];
            } else if (next[menuId]) {
                next[menuId] = {
                    ...next[menuId],
                    qty: newQty,
                };
            }
            return next;
        });
    };

    // Update catatan per item
    const updateItemNote = (menuId, note) => {
        setCart((prev) => {
            if (!prev[menuId]) return prev;
            return {
                ...prev,
                [menuId]: {
                    ...prev[menuId],
                    note,
                },
            };
        });
    };

    // Hapus satu item dari keranjang
    const removeFromCart = (menuId) => {
        setCart((prev) => {
            const next = { ...prev };
            delete next[menuId];
            return next;
        });
    };

    // Hitung kalkulasi finansial di sisi klien untuk pratinjau staf
    const cartItemsArray = useMemo(() => Object.values(cart), [cart]);

    const calculations = useMemo(() => {
        let subtotal = 0;
        cartItemsArray.forEach((item) => {
            subtotal += Number(item.menu.price) * item.qty;
        });
        const tax = Math.round((subtotal * taxPercent) / 100 * 100) / 100;
        const serviceCharge = Math.round((subtotal * servicePercent) / 100 * 100) / 100;
        const total = subtotal + tax + serviceCharge;

        return { subtotal, tax, serviceCharge, total };
    }, [cartItemsArray, taxPercent, servicePercent]);

    // Filter menu berdasarkan tab kategori dan pencarian
    const filteredCategories = useMemo(() => {
        return categories.map((cat) => {
            const matchedMenus = (cat.menus || []).filter((m) => {
                const matchName = m.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchName;
            });

            return {
                ...cat,
                filteredMenus: matchedMenus,
            };
        }).filter((cat) => {
            if (activeCategoryTab !== 'all' && String(cat.id) !== String(activeCategoryTab)) {
                return false;
            }
            return cat.filteredMenus.length > 0;
        });
    }, [categories, searchQuery, activeCategoryTab]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedReservationId) {
            alert('Silakan pilih reservasi meja terlebih dahulu.');
            return;
        }

        if (cartItemsArray.length === 0) {
            alert('Keranjang pesanan masih kosong. Silakan pilih minimal 1 menu.');
            return;
        }

        const itemsPayload = cartItemsArray.map((item) => ({
            menu_id: item.menu.id,
            qty: item.qty,
            note: item.note || null,
        }));

        setIsSubmitting(true);
        router.post(
            route('orders.store'),
            {
                reservation_id: selectedReservationId,
                items: itemsPayload,
            },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <AuthenticatedLayout header="Buat Pesanan Baru">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Banner Informasi Pemilihan Reservasi */}
                <div className="bg-white p-5 rounded-xl border border-[#E4E7EF] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <span className="text-xs font-semibold text-[#737B91] uppercase tracking-wider block">
                            Target Reservasi Meja
                        </span>
                        {currentReservation ? (
                            <div className="mt-1 flex items-center gap-3">
                                <span className="text-xl font-bold text-[#242943]">
                                    {currentReservation.code}
                                </span>
                                <span className="bg-[#EEF2FF] text-[#4361EE] text-xs px-2.5 py-1 rounded-md font-semibold">
                                    Meja {currentReservation.restaurant_table?.code}
                                </span>
                                <span className="text-sm text-[#737B91]">
                                    Pelanggan: <strong className="text-[#242943]">{currentReservation.customer?.name}</strong>
                                </span>
                            </div>
                        ) : (
                            <p className="text-sm text-[#D97706] font-medium mt-1 inline-flex items-center gap-1.5">
                                <AlertTriangle size={16} />
                                Silakan pilih reservasi yang berstatus dikonfirmasi untuk membuat pesanan.
                            </p>
                        )}
                    </div>

                    <div className="w-full md:w-80">
                        <label className="block text-xs font-medium text-[#242943] mb-1">
                            Ganti Reservasi Terkonfirmasi:
                        </label>
                        <select
                            value={selectedReservationId}
                            onChange={(e) => setSelectedReservationId(e.target.value)}
                            className="w-full border-[#E4E7EF] rounded-lg text-xs text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                        >
                            <option value="">-- Pilih Reservasi Dikonfirmasi --</option>
                            {confirmedReservations.map((res) => (
                                <option key={res.id} value={res.id}>
                                    {res.code} - {res.customer?.name} (Meja {res.restaurant_table?.code})
                                </option>
                            ))}
                        </select>
                        {errors.reservation_id && (
                            <p className="text-[#DC2626] text-xs mt-1">{errors.reservation_id}</p>
                        )}
                    </div>
                </div>

                {/* Layout Grid: Kolom Kiri Katalog Menu, Kolom Kanan Keranjang */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Kolom Kiri: Katalog Menu (7 Kolom) */}
                    <div className="lg:col-span-7 space-y-4">
                        
                        {/* Filter Bar Menu */}
                        <div className="bg-white p-4 rounded-xl border border-[#E4E7EF] space-y-3">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737B91]" />
                                    <input
                                        type="text"
                                        placeholder="Cari menu makanan atau minuman..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-full border-[#E4E7EF] rounded-lg text-sm text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                    />
                                </div>
                            </div>

                            {/* Tab Kategori */}
                            <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setActiveCategoryTab('all')}
                                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                                        activeCategoryTab === 'all'
                                            ? 'bg-[#4361EE] text-white'
                                            : 'bg-white text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] hover:bg-gray-50'
                                    }`}
                                >
                                    Semua Kategori
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCategoryTab(String(cat.id))}
                                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                                            String(activeCategoryTab) === String(cat.id)
                                                ? 'bg-[#4361EE] text-white'
                                                : 'bg-white text-[#737B91] hover:text-[#242943] border border-[#E4E7EF] hover:bg-gray-50'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Daftar Menu per Kategori */}
                        <div className="space-y-6">
                            {filteredCategories.length === 0 ? (
                                <div className="bg-white p-8 rounded-xl text-center text-[#737B91] text-sm border border-[#E4E7EF]">
                                    Tidak ada menu yang sesuai dengan pencarian.
                                </div>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <div key={cat.id} className="bg-white p-5 rounded-xl border border-[#E4E7EF] space-y-3">
                                        <h3 className="font-bold text-[#242943] text-base border-b border-[#E4E7EF] pb-2">
                                            {cat.name}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {cat.filteredMenus.map((menu) => {
                                                const inCart = cart[menu.id];
                                                return (
                                                    <div
                                                        key={menu.id}
                                                        className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                                                            !menu.is_available
                                                                ? 'bg-[#F7F8FC] border-[#E4E7EF] opacity-60 cursor-not-allowed'
                                                                : inCart
                                                                ? 'bg-[#EEF2FF] border-[#4361EE]'
                                                                : 'bg-white border-[#E4E7EF] hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h4 className="font-semibold text-[#242943] text-sm">
                                                                    {menu.name}
                                                                </h4>
                                                                {!menu.is_available && (
                                                                    <span className="bg-[#FEE2E2] text-[#DC2626] text-3xs font-semibold px-1.5 py-0.5 rounded-md">
                                                                        Habis
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {menu.description && (
                                                                <p className="text-xs text-[#737B91] line-clamp-2 mt-1">
                                                                    {menu.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E4E7EF]">
                                                            <span className="font-bold text-[#4361EE] text-sm">
                                                                Rp {Number(menu.price).toLocaleString('id-ID')}
                                                            </span>

                                                            {menu.is_available && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addToCart(menu)}
                                                                    className="inline-flex items-center gap-1 bg-[#4361EE] hover:bg-[#3A53D0] text-white px-3 py-1 rounded-lg text-xs font-semibold transition"
                                                                >
                                                                    <Plus size={13} />
                                                                    <span>{inCart ? `Tambah (${inCart.qty})` : 'Pesan'}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>

                    {/* Kolom Kanan: Keranjang Pesanan (5 Kolom Sticky) */}
                    <div className="lg:col-span-5 sticky top-4 space-y-4">
                        <div className="bg-white p-5 rounded-xl border border-[#E4E7EF] space-y-4">
                            <div className="flex justify-between items-center border-b border-[#E4E7EF] pb-3">
                                <h3 className="font-bold text-[#242943] text-base flex items-center gap-2">
                                    <ShoppingCart size={18} className="text-[#4361EE]" />
                                    <span>Keranjang Pesanan</span>
                                </h3>
                                <span className="bg-[#F7F8FC] border border-[#E4E7EF] text-[#242943] text-xs px-2.5 py-0.5 rounded-md font-semibold">
                                    {cartItemsArray.length} Menu
                                </span>
                            </div>

                            {/* Daftar Item di Keranjang */}
                            {cartItemsArray.length === 0 ? (
                                <div className="text-center py-8 text-[#737B91] text-sm space-y-2">
                                    <Utensils size={32} className="mx-auto text-[#737B91]" />
                                    <p>Belum ada menu yang dipilih.</p>
                                    <p className="text-xs text-[#737B91]">
                                        Klik tombol "Pesan" pada menu di sebelah kiri.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                                    {cartItemsArray.map(({ menu, qty, note }) => (
                                        <div
                                            key={menu.id}
                                            className="p-3 bg-[#F7F8FC] rounded-lg border border-[#E4E7EF] space-y-2 text-sm"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-semibold text-[#242943] text-xs">
                                                        {menu.name}
                                                    </h5>
                                                    <span className="text-2xs text-[#737B91]">
                                                        @ Rp {Number(menu.price).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(menu.id)}
                                                    className="text-[#737B91] hover:text-[#DC2626] transition"
                                                    title="Hapus menu"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Pengatur Qty & Subtotal Item */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 bg-white border border-[#E4E7EF] rounded-lg p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQty(menu.id, qty - 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-[#242943] hover:bg-[#F7F8FC] rounded text-xs font-bold"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-[#242943]">
                                                        {qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQty(menu.id, qty + 1)}
                                                        className="w-6 h-6 flex items-center justify-center text-[#242943] hover:bg-[#F7F8FC] rounded text-xs font-bold"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-[#242943] text-xs">
                                                    Rp {(Number(menu.price) * qty).toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            {/* Catatan Khusus Per Menu */}
                                            <input
                                                type="text"
                                                placeholder="Catatan (misal: pedas, tanpa es)..."
                                                value={note || ''}
                                                onChange={(e) => updateItemNote(menu.id, e.target.value)}
                                                className="w-full text-2xs border-[#E4E7EF] rounded-lg px-2.5 py-1.5 bg-white text-[#242943] focus:border-[#4361EE] focus:ring-[#4361EE]"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ringkasan Biaya (Preview) */}
                            <div className="border-t border-[#E4E7EF] pt-3 space-y-2 text-xs">
                                <div className="flex justify-between text-[#737B91]">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-[#242943]">Rp {calculations.subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-[#737B91]">
                                    <span>Pajak Restoran ({taxPercent}%)</span>
                                    <span className="font-medium text-[#242943]">Rp {calculations.tax.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-[#737B91]">
                                    <span>Biaya Layanan ({servicePercent}%)</span>
                                    <span className="font-medium text-[#242943]">Rp {calculations.serviceCharge.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-[#242943] pt-2 border-t border-[#E4E7EF]">
                                    <span>Total Pembayaran</span>
                                    <span className="text-[#4361EE]">
                                        Rp {calculations.total.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Tombol Simpan Pesanan */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || cartItemsArray.length === 0 || !selectedReservationId}
                                    className="w-full inline-flex items-center justify-center gap-2 bg-[#4361EE] hover:bg-[#3A53D0] text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 size={18} />
                                    <span>{isSubmitting ? 'Menyimpan Pesanan...' : 'Kirim & Buat Pesanan'}</span>
                                </button>
                                <div className="text-center mt-2">
                                    <Link
                                        href={currentReservation ? route('reservations.show', currentReservation.id) : route('reservations.index')}
                                        className="text-xs text-[#737B91] hover:text-[#242943]"
                                    >
                                        Batal & Kembali
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}

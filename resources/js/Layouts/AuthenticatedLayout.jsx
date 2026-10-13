import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import {
    LayoutDashboard,
    UserRound,
    CalendarDays,
    ClipboardList,
    Armchair,
    Tags,
    Utensils,
    ChartNoAxesColumn,
    Users,
    LogOut,
    Menu as MenuIcon,
    X,
    CheckCircle2,
    AlertCircle,
    UtensilsCrossed,
} from 'lucide-react';

/**
 * AuthenticatedLayout — Colorful Flat Design (design-system.md).
 *
 * Menerapkan:
 * - Palette: Cobalt Blue (#4361EE), Neutral Surface (#FFFFFF), Background (#F7F8FC), Border (#E4E7EF).
 * - Lucide React Iconography outline konsisten tanpa emoji.
 * - Sidebar sticky di viewport dengan scrolling mandiri.
 */
export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const isAdmin = user?.role === 'admin';

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const safeRoute = (name) => {
        try {
            return route(name);
        } catch {
            return '#';
        }
    };

    const navItems = [
        { label: 'Dashboard', href: safeRoute('dashboard'), icon: LayoutDashboard, admin: false },
        { label: 'Pelanggan', href: safeRoute('customers.index'), icon: UserRound, admin: false },
        { label: 'Reservasi', href: safeRoute('reservations.index'), icon: CalendarDays, admin: false },
        { label: 'Pesanan', href: safeRoute('orders.index'), icon: ClipboardList, admin: false },
        { label: 'Meja', href: safeRoute('tables.index'), icon: Armchair, admin: true },
        { label: 'Kategori Menu', href: safeRoute('menu-categories.index'), icon: Tags, admin: true },
        { label: 'Menu', href: safeRoute('menus.index'), icon: Utensils, admin: true },
        { label: 'Laporan', href: safeRoute('reports.index'), icon: ChartNoAxesColumn, admin: true },
        { label: 'Pengguna', href: safeRoute('users.index'), icon: Users, admin: true },
    ];

    const visibleNav = navItems.filter((item) => !item.admin || isAdmin);

    const NavLink = ({ item }) => {
        const IconComponent = item.icon;
        let isActive = false;
        if (item.href !== '#') {
            try {
                isActive = window.location.pathname.startsWith(new URL(item.href).pathname);
            } catch {
                isActive = false;
            }
        }

        return (
            <Link
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                        ? 'bg-[#EEF2FF] text-[#4361EE] font-semibold'
                        : 'text-[#737B91] hover:bg-[#F7F8FC] hover:text-[#242943]'
                }`}
            >
                <IconComponent size={19} strokeWidth={isActive ? 2.3 : 1.8} />
                <span>{item.label}</span>
            </Link>
        );
    };

    const SidebarContent = () => (
        <aside className="flex flex-col w-64 h-screen bg-white border-r border-[#E4E7EF]">
            {/* Logo Restoran */}
            <div className="px-5 py-4 border-b border-[#E4E7EF] flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[#4361EE] text-white flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed size={20} strokeWidth={2.2} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-[#242943] leading-tight">Sistem Restoran</h1>
                    <p className="text-[11px] text-[#737B91]">Kasir &amp; Reservasi</p>
                </div>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {visibleNav.map((item) => (
                    <NavLink key={item.label} item={item} />
                ))}
            </nav>

            {/* Info User & Logout */}
            <div className="p-4 border-t border-[#E4E7EF] bg-[#F7F8FC] flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="truncate">
                        <div className="text-xs font-bold text-[#242943] truncate">{user?.name}</div>
                        <div className="text-[10px] text-[#737B91] truncate">{user?.email}</div>
                    </div>
                    <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            isAdmin ? 'bg-[#EEF2FF] text-[#4361EE]' : 'bg-[#DCFCE7] text-[#16A34A]'
                        }`}
                    >
                        {user?.role}
                    </span>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                >
                    <LogOut size={14} />
                    <span>Keluar Akun</span>
                </Link>
            </div>
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-[#F7F8FC]">
            {/* Sidebar desktop */}
            <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen z-20">
                <SidebarContent />
            </div>

            {/* Sidebar mobile (drawer) */}
            <Transition show={sidebarOpen}>
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <Transition.Child
                        enter="transition-opacity ease-linear duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                    </Transition.Child>
                    <Transition.Child
                        enter="transition ease-in-out duration-200 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-200 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <div className="relative flex">
                            <SidebarContent />
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 right-[-42px] p-2 bg-white rounded-r-lg text-[#242943] shadow-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </Transition.Child>
                </div>
            </Transition>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="bg-white border-b border-[#E4E7EF] sticky top-0 z-10">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-1.5 rounded-lg border border-[#E4E7EF] text-[#737B91] hover:text-[#242943]"
                            >
                                <MenuIcon size={18} />
                            </button>
                            {header && <h2 className="text-base font-bold text-[#242943]">{header}</h2>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-block text-xs text-[#737B91]">
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                <div className="px-4 sm:px-6 pt-4 space-y-2">
                    {flash?.success && (
                        <div className="flex items-center gap-2 bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] px-4 py-3 rounded-lg text-xs sm:text-sm font-medium">
                            <CheckCircle2 size={18} className="flex-shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="flex items-center gap-2 bg-[#FEE2E2] border border-[#FECACA] text-[#DC2626] px-4 py-3 rounded-lg text-xs sm:text-sm font-medium">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{flash.error}</span>
                        </div>
                    )}
                </div>

                {/* Page Content */}
                <main className="flex-1 px-4 sm:px-6 py-5">{children}</main>
            </div>
        </div>
    );
}

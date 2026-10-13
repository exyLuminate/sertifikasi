import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-[#4361EE] bg-[#EEF2FF] text-[#4361EE] font-semibold'
                    : 'border-transparent text-[#737B91] hover:border-[#E4E7EF] hover:bg-gray-50 hover:text-[#242943]'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}

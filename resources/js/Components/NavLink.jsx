import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-[#4361EE] text-[#4361EE] font-semibold'
                    : 'border-transparent text-[#737B91] hover:border-[#E4E7EF] hover:text-[#242943]') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}

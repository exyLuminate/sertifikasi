export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-[#DC2626] hover:bg-[#B91C1C] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

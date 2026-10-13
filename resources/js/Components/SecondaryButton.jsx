export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4E7EF] bg-white hover:bg-[#F7F8FC] px-4 py-2.5 text-sm font-semibold text-[#242943] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

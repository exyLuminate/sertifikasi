export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-[#4361EE] hover:bg-[#3A53D0] active:bg-[#2B44C1] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/40 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

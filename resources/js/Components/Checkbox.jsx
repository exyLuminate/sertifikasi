export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-md border-[#E4E7EF] text-[#4361EE] focus:ring-[#4361EE] focus:ring-offset-0 transition ' +
                className
            }
        />
    );
}

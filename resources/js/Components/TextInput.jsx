import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border-[#E4E7EF] text-[#242943] bg-white placeholder-[#737B91] text-sm py-2.5 px-3.5 transition-colors focus:border-[#4361EE] focus:ring-[#4361EE] ' +
                className
            }
            ref={localRef}
        />
    );
});

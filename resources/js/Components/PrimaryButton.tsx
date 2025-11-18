import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-full bg-gradient-to-br from-quest-500 to-quest-600 px-8 py-3 text-lg font-black text-white shadow-lg border-4 border-white transition hover:scale-110 hover:shadow-2xl transform ${
                    disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

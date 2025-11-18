import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-lg border-4 border-adventure-400 text-adventure-700 shadow-lg focus:ring-4 focus:ring-cyan-300 w-5 h-5 ' +
                className
            }
        />
    );
}

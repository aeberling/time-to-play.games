import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-8 py-3 pe-4 ps-4 ${
                active
                    ? 'border-quest-500 bg-gradient-to-r from-quest-100 to-adventure-100 text-adventure-900 font-black'
                    : 'border-transparent text-adventure-700 hover:border-adventure-400 hover:bg-adventure-50 hover:text-adventure-900 font-bold'
            } text-lg transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}

import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-4 px-3 pt-1 text-base font-black leading-5 transition duration-150 ease-in-out focus:outline-none hover:scale-105 transform ' +
                (active
                    ? 'border-quest-500 text-white drop-shadow-md'
                    : 'border-transparent text-adventure-100 hover:border-quest-300 hover:text-white') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}

import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-cyan-400 via-adventure-400 to-adventure-200 pt-6 sm:justify-center sm:pt-0">
            <div className="transform transition hover:scale-110 mb-8">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24 fill-current text-white drop-shadow-lg" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-8 py-8 shadow-2xl sm:max-w-md rounded-3xl border-8 border-white">
                {children}
            </div>
        </div>
    );
}

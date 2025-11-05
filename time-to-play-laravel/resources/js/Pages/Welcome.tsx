import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Welcome to Time to Play" />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                {/* Navigation */}
                <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-10 w-auto fill-current text-indigo-600" />
                                <span className="text-xl font-bold text-gray-900">
                                    Time to Play
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:text-indigo-600"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
                                <span className="block">Time to Play</span>
                                <span className="block text-indigo-600">
                                    Classic Card Games
                                </span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
                                Join friends online and play your favorite card
                                games. Create a lobby, invite players, and start
                                playing in seconds.
                            </p>
                            <div className="mt-10 flex justify-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href="/games/lobby"
                                        className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl"
                                    >
                                        Go to Lobby
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-indigo-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl"
                                        >
                                            Start Playing
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border-2 border-indigo-600 px-8 py-4 text-lg font-medium text-indigo-600 transition hover:bg-indigo-50"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                Why Play Here?
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Everything you need for a great gaming
                                experience
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-white p-6 shadow-md transition hover:shadow-lg">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                    Play with Friends
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Create private lobbies and invite your
                                    friends to join. Play together in real-time
                                    from anywhere.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-white p-6 shadow-md transition hover:shadow-lg">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                    Instant Gameplay
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    No downloads required. Jump into a game
                                    instantly from your browser. Simple and
                                    fast.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-white p-6 shadow-md transition hover:shadow-lg">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                    Easy to Learn
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Classic card games with simple rules.
                                    Perfect for quick games or long sessions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Games Section */}
                <div className="bg-gray-50 py-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                Available Games
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Choose from a variety of classic card games
                            </p>
                        </div>

                        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* War */}
                            <div className="overflow-hidden rounded-lg bg-white shadow-lg transition hover:shadow-xl">
                                <div className="h-48 bg-gradient-to-br from-red-500 to-red-700"></div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        War
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        Classic card battle game. Flip cards and
                                        see who has the highest value!
                                    </p>
                                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                />
                                            </svg>
                                            2-4 Players
                                        </span>
                                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                            Easy
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* More games placeholder */}
                            <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white transition hover:border-indigo-300">
                                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                        <svg
                                            className="h-8 w-8"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                        More Coming Soon
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        We're adding new games regularly. Stay
                                        tuned!
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white transition hover:border-indigo-300">
                                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                        <svg
                                            className="h-8 w-8"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-gray-900">
                                        Request a Game
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Have a favorite card game? Let us know!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                {!auth.user && (
                    <div className="bg-indigo-600 py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                                    Ready to Play?
                                </h2>
                                <p className="mt-4 text-xl text-indigo-100">
                                    Sign up now and start playing with friends!
                                </p>
                                <div className="mt-8">
                                    <Link
                                        href={route('register')}
                                        className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-medium text-indigo-600 shadow-lg transition hover:bg-gray-50 hover:shadow-xl"
                                    >
                                        Create Free Account
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-white py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center text-sm text-gray-500">
                            <p>
                                &copy; {new Date().getFullYear()} Time to Play.
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

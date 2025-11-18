import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Time to Play - Epic Card Adventures!" />
            <div className="min-h-screen bg-gradient-to-b from-cyan-400 via-adventure-400 to-adventure-200 relative overflow-hidden">
                {/* Whimsical floating clouds */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Cloud 1 */}
                    <div className="absolute top-10 left-20 animate-float-slow">
                        <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                            <ellipse cx="30" cy="35" rx="25" ry="20" fill="white" opacity="0.8" />
                            <ellipse cx="50" cy="30" rx="30" ry="25" fill="white" opacity="0.8" />
                            <ellipse cx="75" cy="35" rx="28" ry="22" fill="white" opacity="0.8" />
                            <ellipse cx="95" cy="40" rx="22" ry="18" fill="white" opacity="0.8" />
                        </svg>
                    </div>
                    {/* Cloud 2 */}
                    <div className="absolute top-32 right-40 animate-float" style={{ animationDelay: '1s' }}>
                        <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
                            <ellipse cx="25" cy="30" rx="20" ry="16" fill="white" opacity="0.7" />
                            <ellipse cx="42" cy="25" rx="25" ry="20" fill="white" opacity="0.7" />
                            <ellipse cx="65" cy="30" rx="23" ry="18" fill="white" opacity="0.7" />
                            <ellipse cx="80" cy="35" rx="18" ry="14" fill="white" opacity="0.7" />
                        </svg>
                    </div>
                    {/* Cloud 3 */}
                    <div className="absolute top-20 right-10 animate-float-slow" style={{ animationDelay: '2s' }}>
                        <svg width="90" height="45" viewBox="0 0 90 45" fill="none">
                            <ellipse cx="20" cy="28" rx="18" ry="14" fill="white" opacity="0.75" />
                            <ellipse cx="35" cy="23" rx="22" ry="18" fill="white" opacity="0.75" />
                            <ellipse cx="55" cy="28" rx="20" ry="16" fill="white" opacity="0.75" />
                            <ellipse cx="70" cy="32" rx="16" ry="12" fill="white" opacity="0.75" />
                        </svg>
                    </div>
                    {/* Stars */}
                    <div className="absolute top-24 left-1/3 text-quest-400 text-2xl animate-pulse">✦</div>
                    <div className="absolute top-40 right-1/4 text-quest-300 text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>
                    <div className="absolute top-16 right-1/3 text-quest-400 text-lg animate-pulse" style={{ animationDelay: '1.5s' }}>✦</div>
                </div>

                {/* Mountain range at bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg width="100%" height="400" viewBox="0 0 1920 400" fill="none" preserveAspectRatio="none">
                        {/* Back mountains */}
                        <path d="M0 400 L0 200 L200 150 L400 220 L600 180 L800 250 L1000 200 L1200 230 L1400 190 L1600 240 L1800 210 L1920 260 L1920 400 Z"
                              fill="#7daba0" opacity="0.6" />
                        {/* Front mountains */}
                        <path d="M0 400 L0 280 L150 240 L300 300 L500 260 L700 320 L900 280 L1100 310 L1300 270 L1500 320 L1700 290 L1920 340 L1920 400 Z"
                              fill="#6d978d" opacity="0.8" />
                        {/* Very front mountains */}
                        <path d="M0 400 L0 340 L100 320 L250 360 L400 340 L600 370 L800 350 L1000 380 L1200 360 L1400 390 L1600 370 L1800 385 L1920 375 L1920 400 Z"
                              fill="#5d837a" />
                    </svg>
                </div>

                {/* Navigation */}
                <nav className="border-b-4 border-adventure-700/30 bg-adventure-600/30 backdrop-blur-md relative z-10 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 justify-between items-center">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-12 w-auto fill-current text-quest-500 drop-shadow-lg" />
                                <div>
                                    <span className="text-3xl font-black gradient-text-yellow drop-shadow-md tracking-tight">
                                        Time to Play
                                    </span>
                                    <p className="text-sm text-adventure-800 font-bold italic">Gather Your Party—The Game Awaits</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-full bg-gradient-to-br from-quest-500 to-quest-600 px-8 py-3 text-base font-black text-white shadow-lg border-4 border-white transition hover:scale-110 hover:shadow-2xl transform"
                                    >
                                        Let's Go!
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-full px-6 py-2 text-base font-bold text-adventure-900 transition hover:text-adventure-700 hover:scale-105"
                                        >
                                            Log In
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-full bg-gradient-to-br from-quest-500 to-quest-600 px-8 py-3 text-base font-black text-white shadow-lg border-4 border-white transition hover:scale-110 hover:shadow-2xl transform"
                                        >
                                            Join Us!
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative overflow-hidden pt-12 pb-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            {/* Floating sword decoration */}
                            <div className="flex justify-center mb-8">
                                <div className="animate-sway">
                                    <svg width="80" height="120" viewBox="0 0 80 120" fill="none">
                                        {/* Sword blade */}
                                        <path d="M35 10 L40 5 L45 10 L42 90 L38 90 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2"/>
                                        {/* Sword guard */}
                                        <rect x="28" y="88" width="24" height="8" rx="2" fill="#ffd700" stroke="#d4a017" strokeWidth="2"/>
                                        {/* Sword handle */}
                                        <rect x="36" y="95" width="8" height="18" rx="2" fill="#8b4513" stroke="#654321" strokeWidth="2"/>
                                        {/* Sword pommel */}
                                        <circle cx="40" cy="115" r="5" fill="#ffd700" stroke="#d4a017" strokeWidth="2"/>
                                    </svg>
                                </div>
                            </div>

                            <h1 className="text-7xl font-black tracking-tight sm:text-8xl md:text-9xl mb-6 drop-shadow-lg">
                                <span className="block text-white text-stroke-adventure">Time to</span>
                                <span className="block text-quest-500 text-stroke-white animate-bounce-slow">
                                    Play!
                                </span>
                            </h1>

                            <p className="mx-auto mt-8 max-w-3xl text-3xl text-adventure-900 font-bold leading-relaxed drop-shadow-md">
                                Rally your crew and dive into epic tabletop adventures! Whether you're slaying dragons or just stealing sheep, glory awaits!
                            </p>

                            <div className="mt-12 flex flex-wrap justify-center gap-6">
                                {auth.user ? (
                                    <Link
                                        href="/games/lobby"
                                        className="group relative rounded-full bg-gradient-to-br from-coral-500 to-coral-600 px-14 py-6 text-2xl font-black text-white shadow-2xl border-8 border-white transition hover:scale-110 hover:rotate-2 transform"
                                    >
                                        <span className="relative z-10">Enter the Game Room!</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('register')}
                                            className="group relative rounded-full bg-gradient-to-br from-coral-500 to-coral-600 px-14 py-6 text-2xl font-black text-white shadow-2xl border-8 border-white transition hover:scale-110 hover:rotate-2 transform"
                                        >
                                            <span className="relative z-10">Start Adventure!</span>
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="rounded-full border-8 border-adventure-700 bg-white/80 backdrop-blur-sm px-14 py-6 text-2xl font-black text-adventure-900 transition hover:scale-110 hover:-rotate-2 hover:bg-white shadow-2xl transform"
                                        >
                                            Come Back!
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Fun stats with icons */}
                            <div className="mt-20 grid grid-cols-3 gap-8 max-w-4xl mx-auto">
                                <div className="text-center transform hover:scale-110 transition">
                                    <div className="text-6xl mb-3 animate-wiggle-slow">🎲</div>
                                    <div className="text-4xl font-black text-quest-600 mb-2">Infinity!</div>
                                    <div className="text-lg font-bold text-adventure-800">Ways to Win</div>
                                </div>
                                <div className="text-center transform hover:scale-110 transition">
                                    <div className="text-6xl mb-3 animate-wiggle-slow" style={{ animationDelay: '0.5s' }}>⚡</div>
                                    <div className="text-4xl font-black text-treasure-600 mb-2">Zero</div>
                                    <div className="text-lg font-bold text-adventure-800">Downloads Needed</div>
                                </div>
                                <div className="text-center transform hover:scale-110 transition">
                                    <div className="text-6xl mb-3 animate-wiggle-slow" style={{ animationDelay: '1s' }}>✨</div>
                                    <div className="text-4xl font-black text-coral-600 mb-2">100%</div>
                                    <div className="text-lg font-bold text-adventure-800">Pure Awesomeness</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white/40 backdrop-blur-sm py-20 relative z-10 border-y-8 border-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-6xl font-black text-adventure-900 mb-4 drop-shadow-md">
                                What Makes It Cool?
                            </h2>
                            <p className="text-2xl text-adventure-800 font-bold">
                                Check out these legendary features!
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="group rounded-3xl bg-gradient-to-br from-treasure-400 to-treasure-500 p-8 border-8 border-white shadow-2xl transition hover:scale-105 hover:rotate-2 transform">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-treasure-700 shadow-lg mb-6 text-4xl font-black border-4 border-treasure-700">
                                    👥
                                </div>
                                <h3 className="text-3xl font-black text-white mb-3 drop-shadow-md">
                                    Gather Your Crew
                                </h3>
                                <p className="text-xl text-white font-bold leading-relaxed">
                                    Call up your best buds from anywhere in the world! Create your own hangout spot and play together!
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group rounded-3xl bg-gradient-to-br from-quest-400 to-quest-600 p-8 border-8 border-white shadow-2xl transition hover:scale-105 hover:-rotate-2 transform">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-quest-700 shadow-lg mb-6 text-4xl font-black border-4 border-quest-700">
                                    ⚡
                                </div>
                                <h3 className="text-3xl font-black text-white mb-3 drop-shadow-md">
                                    Lightning Fast
                                </h3>
                                <p className="text-xl text-white font-bold leading-relaxed">
                                    No waiting, no downloading, no boring setup. Just click and BAM! You're rolling dice and taking names!
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group rounded-3xl bg-gradient-to-br from-coral-400 to-coral-600 p-8 border-8 border-white shadow-2xl transition hover:scale-105 hover:rotate-2 transform">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-coral-700 shadow-lg mb-6 text-4xl font-black border-4 border-coral-700">
                                    🎯
                                </div>
                                <h3 className="text-3xl font-black text-white mb-3 drop-shadow-md">
                                    Super Simple
                                </h3>
                                <p className="text-xl text-white font-bold leading-relaxed">
                                    Easy to learn, hard to master! Jump in and figure it out as you go. It's all good!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Games Section */}
                <div className="py-20 relative z-10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-6xl font-black text-adventure-900 mb-4 drop-shadow-md">
                                Pick Your Adventure!
                            </h2>
                            <p className="text-2xl text-adventure-800 font-bold">
                                Every game is a new story waiting to happen
                            </p>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* War */}
                            <div className="group overflow-hidden rounded-3xl bg-white border-8 border-adventure-700 shadow-2xl transition hover:scale-105 hover:-rotate-1 transform">
                                <div className="h-56 bg-gradient-to-br from-coral-400 via-coral-500 to-coral-600 relative overflow-hidden flex items-center justify-center">
                                    <div className="text-9xl animate-wiggle-slow">⚔️</div>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-black text-coral-700 border-4 border-coral-700">CLASSIC!</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-coral-50 to-white">
                                    <h3 className="text-4xl font-black text-adventure-900 mb-3">
                                        War
                                    </h3>
                                    <p className="text-xl text-adventure-800 font-bold mb-6 leading-relaxed">
                                        Battle royale with cards! Flip, compare, conquer. May the highest card reign supreme!
                                    </p>
                                    <div className="flex items-center gap-4 text-base text-adventure-700">
                                        <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full font-black border-4 border-adventure-600">
                                            👥 2-4
                                        </span>
                                        <span className="rounded-full bg-treasure-500 px-4 py-2 text-sm font-black text-white border-4 border-white">
                                            Easy!
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Oh Hell! */}
                            <div className="group overflow-hidden rounded-3xl bg-white border-8 border-adventure-700 shadow-2xl transition hover:scale-105 hover:rotate-1 transform">
                                <div className="h-56 bg-gradient-to-br from-quest-400 via-quest-500 to-quest-600 relative overflow-hidden flex items-center justify-center">
                                    <div className="text-9xl animate-wiggle-slow">🔥</div>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-black text-quest-700 border-4 border-quest-700">SPICY!</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-quest-50 to-white">
                                    <h3 className="text-4xl font-black text-adventure-900 mb-3">
                                        Oh Hell!
                                    </h3>
                                    <p className="text-xl text-adventure-800 font-bold mb-6 leading-relaxed">
                                        Bid exactly what you'll win or face the consequences! A game of nerve, wit, and calculated risks!
                                    </p>
                                    <div className="flex items-center gap-4 text-base text-adventure-700">
                                        <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full font-black border-4 border-adventure-600">
                                            👥 3-7
                                        </span>
                                        <span className="rounded-full bg-coral-500 px-4 py-2 text-sm font-black text-white border-4 border-white">
                                            Medium!
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Swoop */}
                            <div className="group overflow-hidden rounded-3xl bg-white border-8 border-adventure-700 shadow-2xl transition hover:scale-105 hover:-rotate-1 transform">
                                <div className="h-56 bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 relative overflow-hidden flex items-center justify-center">
                                    <div className="text-9xl animate-wiggle-slow">🦅</div>
                                    <div className="absolute top-4 right-4">
                                        <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-black text-cyan-700 border-4 border-cyan-700">WILD!</span>
                                    </div>
                                </div>
                                <div className="p-8 bg-gradient-to-br from-cyan-50 to-white">
                                    <h3 className="text-4xl font-black text-adventure-900 mb-3">
                                        Swoop
                                    </h3>
                                    <p className="text-xl text-adventure-800 font-bold mb-6 leading-relaxed">
                                        Snatch victory from your opponents! Strategic card-snatching mayhem that'll keep you on your toes!
                                    </p>
                                    <div className="flex items-center gap-4 text-base text-adventure-700">
                                        <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full font-black border-4 border-adventure-600">
                                            👥 2-6
                                        </span>
                                        <span className="rounded-full bg-coral-500 px-4 py-2 text-sm font-black text-white border-4 border-white">
                                            Medium!
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Request a Game */}
                            <div className="group overflow-hidden rounded-3xl border-8 border-dashed border-adventure-700 bg-white/60 backdrop-blur-sm transition hover:scale-105 hover:rotate-1 transform hover:border-solid hover:bg-white/80">
                                <div className="flex h-full flex-col items-center justify-center p-10 text-center">
                                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-treasure-400 to-treasure-600 text-white text-6xl mb-6 border-8 border-white shadow-xl group-hover:animate-wiggle">
                                        💭
                                    </div>
                                    <h3 className="text-3xl font-black text-adventure-900 mb-3">
                                        Your Game Here?
                                    </h3>
                                    <p className="text-xl text-adventure-700 font-bold leading-relaxed">
                                        Got a legendary game we're missing? Drop us a line! We're always hunting for new adventures!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                {!auth.user && (
                    <div className="bg-gradient-to-r from-quest-500 via-quest-600 to-coral-500 py-20 relative z-10 overflow-hidden border-y-8 border-white">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                            {/* Floating elements */}
                            <div className="absolute top-10 left-20 text-white text-6xl animate-float opacity-30">✦</div>
                            <div className="absolute bottom-10 right-20 text-white text-6xl animate-float opacity-30" style={{ animationDelay: '1s' }}>✦</div>

                            <div className="text-center relative z-10">
                                <h2 className="text-6xl font-black text-white mb-6 drop-shadow-2xl">
                                    Ready for Adventure?
                                </h2>
                                <p className="text-3xl text-white font-bold mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                                    Join the party! Sign up now and let's conquer some seriously epic games together!
                                </p>
                                <div className="flex justify-center gap-4">
                                    <Link
                                        href={route('register')}
                                        className="group relative inline-block rounded-full bg-white px-16 py-6 text-3xl font-black text-adventure-900 shadow-2xl transition hover:scale-110 hover:rotate-3 transform border-8 border-adventure-700"
                                    >
                                        <span className="relative z-10">Let's Do This!</span>
                                    </Link>
                                </div>
                                <p className="mt-8 text-xl text-white font-bold drop-shadow-md">
                                    No payment needed! No tricks! Just pure, awesome fun! ✨
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="bg-adventure-700/30 backdrop-blur-sm py-10 relative z-10 border-t-4 border-adventure-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <p className="text-adventure-900 font-bold text-lg mb-2">
                                &copy; {new Date().getFullYear()} Time to Play - Where every game is an adventure!
                            </p>
                            <p className="text-adventure-800 font-bold italic">
                                Roll the dice, take the ride, and let the games decide! 🎲✨
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

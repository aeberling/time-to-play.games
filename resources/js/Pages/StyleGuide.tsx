import { Head } from '@inertiajs/react';

export default function StyleGuide() {
    const colors = {
        adventure: [
            { name: 'Adventure 50', hex: '#faf8ff', usage: 'Lightest backgrounds' },
            { name: 'Adventure 100', hex: '#f6f1fe', usage: 'Light backgrounds' },
            { name: 'Adventure 200', hex: '#e9defc', usage: 'Subtle backgrounds' },
            { name: 'Adventure 300', hex: '#ddcbfa', usage: 'Borders, dividers' },
            { name: 'Adventure 400', hex: '#d0b8f7', usage: 'Hover states' },
            { name: 'Adventure 500', hex: '#c3a5f4', usage: 'Primary purple' },
            { name: 'Adventure 600', hex: '#ad8fea', usage: 'Active states' },
            { name: 'Adventure 700', hex: '#9779d1', usage: 'Text on light' },
            { name: 'Adventure 800', hex: '#8163b8', usage: 'Dark text' },
            { name: 'Adventure 900', hex: '#6b4d9e', usage: 'Darkest purple' },
        ],
        quest: [
            { name: 'Quest 50', hex: '#fffcf0', usage: 'Lightest backgrounds' },
            { name: 'Quest 100', hex: '#fff5d6', usage: 'Light backgrounds' },
            { name: 'Quest 200', hex: '#ffedad', usage: 'Subtle backgrounds' },
            { name: 'Quest 300', hex: '#ffe485', usage: 'Borders, highlights' },
            { name: 'Quest 400', hex: '#ffdb5c', usage: 'Hover states' },
            { name: 'Quest 500', hex: '#ffd333', usage: 'Primary yellow' },
            { name: 'Quest 600', hex: '#ffc107', usage: 'Bright yellow' },
            { name: 'Quest 700', hex: '#e6b01e', usage: 'Active states' },
            { name: 'Quest 800', hex: '#d4a017', usage: 'Dark yellow' },
            { name: 'Quest 900', hex: '#b8860b', usage: 'Darkest gold' },
        ],
        treasure: [
            { name: 'Treasure 50', hex: '#f5faf9', usage: 'Lightest backgrounds' },
            { name: 'Treasure 100', hex: '#e5f3f0', usage: 'Light backgrounds' },
            { name: 'Treasure 200', hex: '#cbe1dc', usage: 'Subtle backgrounds' },
            { name: 'Treasure 300', hex: '#b1cfc8', usage: 'Borders, dividers' },
            { name: 'Treasure 400', hex: '#97bdb4', usage: 'Hover states' },
            { name: 'Treasure 500', hex: '#7daba0', usage: 'Primary teal' },
            { name: 'Treasure 600', hex: '#6d978d', usage: 'Active states' },
            { name: 'Treasure 700', hex: '#5d837a', usage: 'Mountains, nature' },
            { name: 'Treasure 800', hex: '#4d6e67', usage: 'Dark teal' },
            { name: 'Treasure 900', hex: '#3d5a54', usage: 'Darkest teal' },
        ],
        coral: [
            { name: 'Coral 50', hex: '#fff0f7', usage: 'Lightest backgrounds' },
            { name: 'Coral 100', hex: '#ffd6eb', usage: 'Light backgrounds' },
            { name: 'Coral 200', hex: '#ffadd6', usage: 'Subtle backgrounds' },
            { name: 'Coral 300', hex: '#ff85c2', usage: 'Borders, highlights' },
            { name: 'Coral 400', hex: '#ff5cad', usage: 'Hover states' },
            { name: 'Coral 500', hex: '#ff3399', usage: 'Primary pink' },
            { name: 'Coral 600', hex: '#ff0080', usage: 'Bright pink' },
            { name: 'Coral 700', hex: '#eb006c', usage: 'Active states' },
            { name: 'Coral 800', hex: '#d9005d', usage: 'Dark pink' },
            { name: 'Coral 900', hex: '#c7004e', usage: 'Darkest pink' },
        ],
        cyan: [
            { name: 'Cyan 50', hex: '#f0fcfe', usage: 'Lightest backgrounds' },
            { name: 'Cyan 100', hex: '#ccf6fb', usage: 'Light backgrounds' },
            { name: 'Cyan 200', hex: '#99eef8', usage: 'Subtle backgrounds' },
            { name: 'Cyan 300', hex: '#66e5f4', usage: 'Borders, highlights' },
            { name: 'Cyan 400', hex: '#33ddf1', usage: 'Sky gradients' },
            { name: 'Cyan 500', hex: '#00d4ed', usage: 'Primary cyan' },
            { name: 'Cyan 600', hex: '#00bfda', usage: 'Active states' },
            { name: 'Cyan 700', hex: '#00a8c0', usage: 'Buttons, links' },
            { name: 'Cyan 800', hex: '#0091a6', usage: 'Dark cyan' },
            { name: 'Cyan 900', hex: '#007a8c', usage: 'Darkest cyan' },
        ],
    };

    return (
        <>
            <Head title="Brand Style Guide - Time to Play" />
            <div className="min-h-screen bg-gradient-to-b from-adventure-100 to-white">
                {/* Header */}
                <div className="bg-white py-16 border-b-8 border-adventure-700">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h1 className="text-7xl font-black mb-4 text-center">
                            <span className="gradient-text">Time to Play</span>
                        </h1>
                        <p className="text-3xl font-bold text-adventure-800 text-center">
                            Brand Style Guide
                        </p>
                        <p className="text-xl font-bold text-adventure-600 text-center mt-4">
                            Gather Your Party—The Game Awaits
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    {/* Brand Overview */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Brand Overview
                        </h2>
                        <div className="bg-white rounded-3xl border-8 border-adventure-700 p-8 shadow-2xl">
                            <h3 className="text-3xl font-black text-adventure-900 mb-4">Design Philosophy</h3>
                            <p className="text-xl text-adventure-800 font-bold leading-relaxed mb-6">
                                Time to Play embraces a whimsical, Adventure Time-inspired aesthetic that brings joy,
                                playfulness, and excitement to tabletop gaming. Our design is bold, colorful, and unapologetically fun!
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-quest-100 to-white p-6 rounded-2xl border-4 border-quest-600">
                                    <h4 className="text-2xl font-black text-adventure-900 mb-2">Bold & Playful</h4>
                                    <p className="text-adventure-800 font-bold">Big, chunky borders and rounded corners create a cartoon-like, friendly feel</p>
                                </div>
                                <div className="bg-gradient-to-br from-coral-100 to-white p-6 rounded-2xl border-4 border-coral-600">
                                    <h4 className="text-2xl font-black text-adventure-900 mb-2">Vibrant Colors</h4>
                                    <p className="text-adventure-800 font-bold">Our palette is inspired by adventure and fantasy, using bright, saturated colors</p>
                                </div>
                                <div className="bg-gradient-to-br from-treasure-100 to-white p-6 rounded-2xl border-4 border-treasure-600">
                                    <h4 className="text-2xl font-black text-adventure-900 mb-2">Animated & Alive</h4>
                                    <p className="text-adventure-800 font-bold">Subtle animations bring personality and delight to every interaction</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Color Palette */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Color Palette
                        </h2>

                        {Object.entries(colors).map(([name, shades]) => (
                            <div key={name} className="mb-12">
                                <h3 className="text-3xl font-black text-adventure-900 mb-4 capitalize">{name}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                                    {shades.map((shade) => (
                                        <div key={shade.name} className="group">
                                            <div
                                                className="h-24 rounded-2xl border-4 border-adventure-700 shadow-lg transition hover:scale-110 hover:rotate-2 cursor-pointer"
                                                style={{ backgroundColor: shade.hex }}
                                            />
                                            <p className="text-sm font-black text-adventure-900 mt-2">{shade.name.split(' ')[1]}</p>
                                            <p className="text-xs font-bold text-adventure-700">{shade.hex}</p>
                                            <p className="text-xs text-adventure-600 mt-1">{shade.usage}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Typography */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Typography
                        </h2>
                        <div className="bg-white rounded-3xl border-8 border-adventure-700 p-8 shadow-2xl space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-adventure-900 mb-4">Font Family</h3>
                                <p className="text-xl font-bold text-adventure-800 mb-2">Primary: Figtree (sans-serif)</p>
                                <p className="text-adventure-700">Used for all body text, buttons, and general UI elements</p>
                            </div>

                            <div className="space-y-4 border-t-4 border-adventure-300 pt-6">
                                <h3 className="text-2xl font-black text-adventure-900 mb-4">Gradient Text Effect</h3>
                                <div className="bg-gradient-to-br from-adventure-50 to-cyan-50 p-8 rounded-2xl border-4 border-adventure-500">
                                    <p className="text-6xl font-black gradient-text text-center mb-6">Gradient Text!</p>
                                    <div className="space-y-2">
                                        <p className="text-lg font-bold text-adventure-800">CSS Class: <code className="bg-adventure-200 px-2 py-1 rounded">gradient-text</code></p>
                                        <div className="bg-white p-4 rounded-lg font-mono text-sm text-adventure-800 mt-4">
                                            <p>.gradient-text {'{'}</p>
                                            <p className="ml-4">display: inline-block;</p>
                                            <p className="ml-4">background-image: linear-gradient(to right, #5d837a, #9779d1);</p>
                                            <p className="ml-4">background-clip: text;</p>
                                            <p className="ml-4">-webkit-background-clip: text;</p>
                                            <p className="ml-4">-webkit-text-fill-color: transparent;</p>
                                            <p className="ml-4">color: transparent;</p>
                                            <p>{'}'}</p>
                                        </div>
                                        <p className="text-adventure-700 mt-4 italic">💡 Customize the gradient colors to match your design needs!</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t-4 border-adventure-300 pt-6">
                                <h3 className="text-2xl font-black text-adventure-900 mb-4">Heading Styles</h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm text-adventure-600 mb-2">Heading 1 - Hero Titles</p>
                                        <h1 className="text-7xl font-black text-adventure-900">Time to Play!</h1>
                                        <code className="text-sm text-adventure-600 block mt-2">text-7xl font-black</code>
                                    </div>
                                    <div>
                                        <p className="text-sm text-adventure-600 mb-2">Heading 2 - Section Titles</p>
                                        <h2 className="text-5xl font-black text-adventure-900">Pick Your Adventure!</h2>
                                        <code className="text-sm text-adventure-600 block mt-2">text-5xl font-black</code>
                                    </div>
                                    <div>
                                        <p className="text-sm text-adventure-600 mb-2">Heading 3 - Card Titles</p>
                                        <h3 className="text-3xl font-black text-adventure-900">Oh Hell!</h3>
                                        <code className="text-sm text-adventure-600 block mt-2">text-3xl font-black</code>
                                    </div>
                                    <div>
                                        <p className="text-sm text-adventure-600 mb-2">Body Text</p>
                                        <p className="text-xl font-bold text-adventure-800">Rally your crew and dive into epic tabletop adventures!</p>
                                        <code className="text-sm text-adventure-600 block mt-2">text-xl font-bold</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Buttons */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Button Styles
                        </h2>
                        <div className="bg-white rounded-3xl border-8 border-adventure-700 p-8 shadow-2xl">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl font-black text-adventure-900 mb-4">Primary Button</h3>
                                    <button className="rounded-full bg-gradient-to-br from-quest-500 to-quest-600 px-12 py-4 text-xl font-black text-white shadow-lg border-8 border-white transition hover:scale-110 hover:shadow-2xl transform">
                                        Start Adventure!
                                    </button>
                                    <code className="text-sm text-adventure-600 block mt-4">
                                        rounded-full bg-gradient-to-br from-quest-500 to-quest-600 px-12 py-4 text-xl font-black text-white shadow-lg border-8 border-white transition hover:scale-110
                                    </code>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-adventure-900 mb-4">Secondary Button</h3>
                                    <button className="rounded-full border-8 border-adventure-700 bg-white px-12 py-4 text-xl font-black text-adventure-900 transition hover:scale-110 shadow-lg">
                                        Learn More
                                    </button>
                                    <code className="text-sm text-adventure-600 block mt-4">
                                        rounded-full border-8 border-adventure-700 bg-white px-12 py-4 text-xl font-black text-adventure-900 transition hover:scale-110
                                    </code>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-adventure-900 mb-4">CTA Button (Coral)</h3>
                                    <button className="rounded-full bg-gradient-to-br from-coral-500 to-coral-600 px-14 py-6 text-2xl font-black text-white shadow-2xl border-8 border-white transition hover:scale-110 hover:rotate-2 transform">
                                        Join the Party!
                                    </button>
                                    <code className="text-sm text-adventure-600 block mt-4">
                                        rounded-full bg-gradient-to-br from-coral-500 to-coral-600 px-14 py-6 text-2xl font-black text-white shadow-2xl border-8 border-white transition hover:scale-110 hover:rotate-2
                                    </code>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cards */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Card Styles
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature Card */}
                            <div className="rounded-3xl bg-gradient-to-br from-treasure-400 to-treasure-500 p-8 border-8 border-white shadow-2xl transition hover:scale-105 hover:rotate-2 transform">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-treasure-700 shadow-lg mb-6 text-4xl font-black border-4 border-treasure-700">
                                    🎲
                                </div>
                                <h3 className="text-3xl font-black text-white mb-3 drop-shadow-md">
                                    Feature Card
                                </h3>
                                <p className="text-xl text-white font-bold leading-relaxed">
                                    Used for highlighting key features with gradients and icons.
                                </p>
                            </div>

                            {/* Game Card */}
                            <div className="overflow-hidden rounded-3xl bg-white border-8 border-adventure-700 shadow-2xl transition hover:scale-105 hover:-rotate-1 transform">
                                <div className="h-48 bg-gradient-to-br from-coral-400 via-coral-500 to-coral-600 relative overflow-hidden flex items-center justify-center">
                                    <div className="text-8xl">⚔️</div>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-coral-50 to-white">
                                    <h3 className="text-3xl font-black text-adventure-900 mb-2">
                                        Game Card
                                    </h3>
                                    <p className="text-lg text-adventure-800 font-bold">
                                        For showcasing individual games with emoji icons.
                                    </p>
                                </div>
                            </div>

                            {/* Placeholder Card */}
                            <div className="overflow-hidden rounded-3xl border-8 border-dashed border-adventure-700 bg-white/60 backdrop-blur-sm transition hover:scale-105 hover:rotate-1 transform hover:border-solid hover:bg-white/80">
                                <div className="flex h-full flex-col items-center justify-center p-8 text-center min-h-[300px]">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-quest-400 to-quest-600 text-white text-5xl mb-6 border-8 border-white shadow-xl">
                                        ✨
                                    </div>
                                    <h3 className="text-2xl font-black text-adventure-900 mb-2">
                                        Placeholder
                                    </h3>
                                    <p className="text-lg text-adventure-700 font-bold">
                                        For coming soon content
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Animations */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Animations
                        </h2>
                        <div className="bg-white rounded-3xl border-8 border-adventure-700 p-8 shadow-2xl">
                            <div className="grid md:grid-cols-4 gap-8 text-center">
                                <div>
                                    <div className="text-6xl mb-4 animate-wiggle-slow">🎲</div>
                                    <h4 className="text-xl font-black text-adventure-900 mb-2">Wiggle</h4>
                                    <code className="text-sm text-adventure-600">animate-wiggle-slow</code>
                                </div>
                                <div>
                                    <div className="text-6xl mb-4 animate-float">☁️</div>
                                    <h4 className="text-xl font-black text-adventure-900 mb-2">Float</h4>
                                    <code className="text-sm text-adventure-600">animate-float</code>
                                </div>
                                <div>
                                    <div className="text-6xl mb-4 animate-bounce-slow">⭐</div>
                                    <h4 className="text-xl font-black text-adventure-900 mb-2">Bounce</h4>
                                    <code className="text-sm text-adventure-600">animate-bounce-slow</code>
                                </div>
                                <div>
                                    <div className="text-6xl mb-4 animate-pulse">✨</div>
                                    <h4 className="text-xl font-black text-adventure-900 mb-2">Pulse</h4>
                                    <code className="text-sm text-adventure-600">animate-pulse</code>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t-4 border-adventure-300">
                                <h4 className="text-2xl font-black text-adventure-900 mb-4">Hover Effects</h4>
                                <div className="flex gap-4 flex-wrap">
                                    <button className="bg-quest-500 text-white px-6 py-3 rounded-full font-black transition hover:scale-110">
                                        Scale on Hover
                                    </button>
                                    <button className="bg-coral-500 text-white px-6 py-3 rounded-full font-black transition hover:rotate-2">
                                        Rotate on Hover
                                    </button>
                                    <button className="bg-treasure-500 text-white px-6 py-3 rounded-full font-black transition hover:shadow-2xl">
                                        Shadow on Hover
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Design Principles */}
                    <section className="mb-20">
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Design Principles
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl border-8 border-adventure-700 p-8 shadow-2xl">
                                <h3 className="text-3xl font-black text-adventure-900 mb-4">✅ Do This</h3>
                                <ul className="space-y-3 text-xl font-bold text-adventure-800">
                                    <li>• Use rounded-3xl for major containers</li>
                                    <li>• Apply border-8 for prominent borders</li>
                                    <li>• Use font-black for headings</li>
                                    <li>• Add drop-shadow-lg for depth</li>
                                    <li>• Include hover states with scale/rotate</li>
                                    <li>• Use emojis for visual interest</li>
                                    <li>• Keep copy fun and energetic</li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-3xl border-8 border-coral-600 p-8 shadow-2xl">
                                <h3 className="text-3xl font-black text-coral-600 mb-4">❌ Avoid This</h3>
                                <ul className="space-y-3 text-xl font-bold text-adventure-800">
                                    <li>• Sharp corners (use rounded)</li>
                                    <li>• Thin borders (go chunky!)</li>
                                    <li>• Light font weights (use bold/black)</li>
                                    <li>• Flat, lifeless designs</li>
                                    <li>• Static elements (add animation!)</li>
                                    <li>• Corporate, serious language</li>
                                    <li>• Muted, dull colors</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Spacing & Layout */}
                    <section>
                        <h2 className="text-5xl font-black text-adventure-900 mb-6 border-b-4 border-adventure-500 pb-3">
                            Spacing & Layout
                        </h2>
                        <div className="bg-white rounded-3xl border-8 border-adventure-700 p-8 shadow-2xl">
                            <div className="grid md:grid-cols-3 gap-8">
                                <div>
                                    <h4 className="text-2xl font-black text-adventure-900 mb-3">Container</h4>
                                    <code className="text-adventure-700 font-bold block">max-w-7xl mx-auto px-4 sm:px-6 lg:px-8</code>
                                    <p className="text-adventure-600 mt-2">Standard page container</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-adventure-900 mb-3">Section Spacing</h4>
                                    <code className="text-adventure-700 font-bold block">py-16 md:py-20</code>
                                    <p className="text-adventure-600 mt-2">Between major sections</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-adventure-900 mb-3">Card Padding</h4>
                                    <code className="text-adventure-700 font-bold block">p-8</code>
                                    <p className="text-adventure-600 mt-2">Inside cards and containers</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="bg-adventure-700 text-white py-12 mt-20 border-t-8 border-adventure-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-2xl font-black mb-2">Time to Play Brand Style Guide</p>
                        <p className="text-adventure-200 font-bold">Keep it bold, keep it playful, keep it fun! 🎲✨</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

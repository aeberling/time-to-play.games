export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 font-heading bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
          Time to Play
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Classic card games with friends, anytime, anywhere
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Play as Guest
          </button>
          <button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors">
            Create Account
          </button>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          🎮 No signup required • 🔄 Never lose progress • 🎨 Beautiful themes
        </div>
      </div>
    </main>
  );
}

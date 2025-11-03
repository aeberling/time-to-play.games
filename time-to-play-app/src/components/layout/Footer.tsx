import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold font-heading bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
              Time to Play
            </h3>
            <p className="text-sm text-gray-600">
              Classic card games with friends, anytime, anywhere.
            </p>
          </div>

          {/* Games */}
          <div>
            <h4 className="font-semibold mb-3">Games</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/games/war" className="hover:text-gray-900 transition-colors">
                  War
                </Link>
              </li>
              <li>
                <Link href="/games" className="hover:text-gray-900 transition-colors">
                  All Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Time to Play. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

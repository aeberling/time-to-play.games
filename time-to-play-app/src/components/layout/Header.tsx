'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold font-heading bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            Time to Play
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/play" className="text-gray-600 hover:text-gray-900 transition-colors">
            Play
          </Link>
          <Link href="/games" className="text-gray-600 hover:text-gray-900 transition-colors">
            Games
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
            About
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/play">Play Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/play"
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Play
            </Link>
            <Link
              href="/games"
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Games
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-3 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/play">Play Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

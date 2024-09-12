'use client';

import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';
import { inter } from '@/app/fonts';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-black backdrop-blur-md z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
            <Image
                src="/logo-inverse.png"
                alt="Market Lens Logo"
                width={500}
                height={500}
                className="h-8 w-8"
            />
              <span className={`${inter.className} ml-4 text-white font-medium`}>Market Lens</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link 
              href="/signup"
              className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 
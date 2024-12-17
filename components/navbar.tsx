'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { inter } from '@/app/fonts';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { signOut } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (pathname !== '/login') {
          setIsLoggedIn(!!session);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (pathname !== '/login') {
        setIsLoggedIn(!!session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return null;
  }

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
          {!isAuthPage && (
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <button
                  onClick={handleSignOut}
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link 
                  href="/login"
                  className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 
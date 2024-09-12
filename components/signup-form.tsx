'use client';

import { inter } from '@/app/fonts';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from './ui/signup-form/button';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/login?message=Check your email to confirm your account');
      }
    } catch (error) {
      setError('An error occurred during sign up');
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-3">
      <div className="flex-1 rounded-lg bg-black px-6 pb-4 pt-8">
        <h1 className={`${inter.className} mb-3 text-2xl text-white`}>
          Create an account
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-200"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-700 bg-black py-[9px] px-3 text-sm text-white placeholder:text-gray-500 focus:border-gray-400 focus:outline-none"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-200"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-700 bg-black py-[9px] px-3 text-sm text-white placeholder:text-gray-500 focus:border-gray-400 focus:outline-none"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        <Button className="mt-4 w-full bg-white text-black hover:bg-gray-200">
          Create account
        </Button>
        {error && (
          <div className="mt-4 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}

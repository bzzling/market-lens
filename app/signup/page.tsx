'use client';

import SignupForm from '@/components/signup-form';
import { Suspense, useEffect } from 'react';

export default function SignupPage() {
  useEffect(() => {
    document.body.classList.add('dark');
    return () => {
      document.body.classList.remove('dark');
    }
  }, []);
  
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignupForm className="w-full max-w-4xl px-4" />
      </Suspense>
    </div>
  )
}
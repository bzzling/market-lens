'use client';

import LoginForm from '@/components/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm className="w-full max-w-4xl px-4" />
      </Suspense>
    </div>
  )
}

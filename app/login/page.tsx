'use client';

import LoginForm from "@/components/login-form"
import { useEffect } from "react"

export default function LoginPage() {
  useEffect(() => {
    document.body.classList.add('dark');
    return () => {
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}

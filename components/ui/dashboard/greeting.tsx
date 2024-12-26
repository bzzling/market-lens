'use client';

import { inter } from '@/app/fonts';

interface GreetingProps {
  name: string;
}

export default function Greeting({ name }: GreetingProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <h2 className={`${inter.className} text-3xl font-bold tracking-tight`}>
      {getGreeting()}, {name}
    </h2>
  );
} 
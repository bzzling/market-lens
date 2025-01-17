'use client';

interface GreetingProps {
  name: string;
}

export default function Greeting({ name }: GreetingProps) {
  return (
    <h1 className="text-2xl font-bold">
      Welcome back, {name}
    </h1>
  );
} 
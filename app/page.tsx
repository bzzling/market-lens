import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { spaceGrotesk } from '@/app/fonts';

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-col justify-center gap-6 rounded-lg bg-white p-6 md:w-2/3 lg:px-12 xl:px-24">
            <p className={`${spaceGrotesk.className} text-xl text-gray-900 md:text-3xl md:leading-normal`}>
              <strong>Welcome to Market Lens.</strong> A modern stock market simulator built specifically
              for investors, students, and enthusiasts.
            </p>
            <Link
              href="/signup"
              className="flex items-center gap-5 self-start rounded-lg bg-black px-6 sm:px-12 md:px-16 lg:px-20 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 md:text-base"
            >
              <span>Get Started</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
          </div>
          <div className="flex items-center justify-center p-3 md:w-1/3 lg:px-6 xl:px-8">
            <Image
              src="/bull.svg"
              width={703.125}
              height={534.375}
              className="hidden md:block w-full h-auto max-w-[400px]"
              alt="Bull"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

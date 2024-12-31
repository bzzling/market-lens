'use client';

import {
  HomeIcon,
  DocumentDuplicateIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Portfolio', href: '/dashboard', icon: HomeIcon},
  { name: 'Trade', href: '/dashboard/trade', icon: DocumentDuplicateIcon },
  { name: 'Learn', href: '/dashboard/learn', icon: BookOpenIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3 border',
              {
                'bg-white text-black hover:bg-gray-100': isActive,
                'bg-zinc-900/50 text-gray-400 hover:bg-zinc-800 hover:text-white': !isActive,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

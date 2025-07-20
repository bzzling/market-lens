"use client";

import Link from "next/link";
import Image from "next/image";
import { inter } from "@/app/fonts";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/user";
import { supabase } from "@/lib/supabaseClient";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const dashboardLinks = [
  { name: "Portfolio", href: "/dashboard", icon: HomeIcon },
  { name: "Trade", href: "/trade", icon: DocumentDuplicateIcon },
  { name: "Learn", href: "/learn", icon: BookOpenIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [userQuery] = useAtom(userAtom);

  const isLoggedIn = !!userQuery.data && !userQuery.isPending;

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full bg-black backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Image
              src="/logo-inverse.png"
              alt="Market Lens Logo"
              width={500}
              height={500}
              className="h-8 w-8"
            />
            <span className={`${inter.className} ml-4 text-white font-medium`}>
              Market Lens
            </span>
          </div>

          {isLoggedIn && (
            <div className="flex items-center space-x-2 md:space-x-4">
              {dashboardLinks.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-2 px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      {
                        "bg-white text-black hover:bg-gray-100": isActive,
                        "text-gray-400 hover:bg-zinc-800 hover:text-white":
                          !isActive,
                      }
                    )}
                    title={link.name}
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span className="hidden md:inline">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center">
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  "bg-white text-black hover:bg-gray-100"
                )}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  "bg-white text-black hover:bg-gray-100"
                )}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

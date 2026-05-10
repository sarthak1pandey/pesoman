"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Receipt, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface/90 backdrop-blur-md shadow-lg border-t border-surface-container">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center relative ${
          isActive("/dashboard") ? "text-primary" : "text-on-surface-variant"
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="font-label-md text-label-md mt-xs">Home</span>
        {isActive("/dashboard") && (
          <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
        )}
      </Link>
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center relative text-on-surface-variant hover:text-primary transition-colors`}
      >
        <Compass className="w-6 h-6" />
        <span className="font-label-md text-label-md mt-xs">Trips</span>
      </Link>
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center relative text-on-surface-variant hover:text-primary transition-colors`}
      >
        <Receipt className="w-6 h-6" />
        <span className="font-label-md text-label-md mt-xs">Activity</span>
      </Link>
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center relative text-on-surface-variant hover:text-primary transition-colors`}
      >
        <User className="w-6 h-6" />
        <span className="font-label-md text-label-md mt-xs">Profile</span>
      </Link>
    </nav>
  );
}

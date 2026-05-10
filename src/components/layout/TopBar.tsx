"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, LogOut } from "lucide-react";

export default function TopBar() {
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 w-full z-40 flex justify-between items-center px-container-padding py-md bg-surface shadow-sm text-primary">
      <Link href="/dashboard" className="flex items-center shrink-0" aria-label="Pesoman home">
        <Image
          src="/branding/logo.png"
          alt="Pesoman"
          width={240}
          height={64}
          className="h-14 w-auto"
          priority
        />
      </Link>
      <div className="flex items-center gap-sm">
        <button className="p-xs text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full active:scale-95">
          <Bell className="w-6 h-6" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md hover:opacity-80 transition-opacity"
          >
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant py-2 z-50">
              <div className="px-4 py-2 border-b border-outline-variant">
                <p className="font-label-md text-label-md text-on-surface">{session?.user?.name}</p>
                <p className="font-caption text-caption text-on-surface-variant">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2 font-body-md text-body-md text-error hover:bg-error-container/20 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

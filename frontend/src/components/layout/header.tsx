/**
 * Application Header/Navigation
 * Used across authenticated pages
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Menu, LogOut, Settings } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/home" className="flex items-center gap-3 hover:opacity-80 transition">
          <Image
            src="/fcs_logo.png"
            alt="FCS Logo"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <span className="text-xl font-bold text-[#010030]">FCS</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/home"
            className="text-[#475569] hover:text-[#010030] transition font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/members"
            className="text-[#475569] hover:text-[#010030] transition font-medium"
          >
            Members
          </Link>
          <Link
            href="/events"
            className="text-[#475569] hover:text-[#010030] transition font-medium"
          >
            Events
          </Link>
          <Link
            href="/registrations"
            className="text-[#475569] hover:text-[#010030] transition font-medium"
          >
            Registrations
          </Link>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4 relative">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-[#010030] text-white flex items-center justify-center font-bold">
              {user?.firstName?.[0] || "U"}
            </div>
            <span className="text-gray-700">{user?.firstName || "User"}</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-[#010030]" />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-[#B91C1C] hover:bg-red-50 transition hidden md:flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-[#CBD5E1] md:hidden shadow-lg">
            <div className="flex flex-col p-4 space-y-3">
              <Link
                href="/home"
                className="text-[#475569] hover:text-[#010030] transition font-medium py-2"
              >
                Dashboard
              </Link>
              <Link
                href="/members"
                className="text-[#475569] hover:text-[#010030] transition font-medium py-2"
              >
                Members
              </Link>
              <Link
                href="/events"
                className="text-[#475569] hover:text-[#010030] transition font-medium py-2"
              >
                Events
              </Link>
              <Link
                href="/registrations"
                className="text-[#475569] hover:text-[#010030] transition font-medium py-2"
              >
                Registrations
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#B91C1C] hover:bg-red-50 transition font-medium py-2 text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Menu,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Users,
  Calendar,
  Building2,
  MapPin,
  UserCircle,
  BarChart3,
  Shield,
  Command,
  Route,
  CheckSquare,
  UsersRound,
  X,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

export function EnhancedHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(0); // Reset mock count for now


  const isAdmin = user?.roles?.some((r: any) => {
    const role = r.toLowerCase();
    return role.includes('admin') || role === 'leader';
  });

  const isRegistrar = user?.roles?.some((r: any) => {
    const role = r.toLowerCase();
    return role === 'registrar';
  });



  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Navigation Groups (Mobile & Command Palette only)
  const adminNavigationGroups = [
    {
      label: "Main",
      items: [
        { href: "/home", label: "Dashboard", icon: BarChart3 },
        { href: "/members", label: "Members", icon: Users },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/registrations", label: "Registrations", icon: CheckSquare },
      ],
    },
    {
      label: "Management",
      items: [
        { href: "/units", label: "Units", icon: Building2 },
        { href: "/centers", label: "Centers", icon: MapPin },
        { href: "/groups", label: "Groups", icon: UsersRound },
        { href: "/attendance", label: "Attendance", icon: CheckSquare },
        { href: "/admin/users", label: "Manage Admins", icon: Shield },
        { href: "/admin/registrars", label: "Manage Registrars", icon: UsersRound },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/reports", label: "Reports", icon: BarChart3 },
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/settings", label: "Settings", icon: Settings },
        { href: "/admin", label: "Admin Panel", icon: Shield },
      ],
    },
  ];

  const registrarNavigationGroups = [
    {
      label: "Menu",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/profile", label: "My Profile", icon: UserCircle },
      ],
    },
    {
      label: "Registrar Portal",
      items: [
        { href: "/my-events", label: "My Registrations", icon: CheckSquare },
        { href: "/registration-tray", label: "Registration Tray", icon: Users },
        { href: "/attendance", label: "Attendance", icon: Users },
        { href: "/print-tags", label: "Print Tags", icon: Users },
        { href: "/extensive-search", label: "Extensive Search", icon: Search },
      ],
    },
  ];

  const memberNavigationGroups = [
    {
      label: "Menu",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/my-events", label: "My Registrations", icon: CheckSquare },
        { href: "/profile", label: "My Profile", icon: UserCircle },
      ],
    }
  ];

  const navigationGroups = isAdmin
    ? adminNavigationGroups
    : isRegistrar
      ? registrarNavigationGroups
      : memberNavigationGroups;

  const quickActions = [
    { href: "/members/new", label: "New Member", icon: Users },
    { href: "/events/new", label: "New Event", icon: Calendar },
    { href: "/units/new", label: "New Unit", icon: Building2 },
    { href: "/centers/new", label: "New Center", icon: MapPin },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href={isAdmin ? "/home" : "/dashboard"} className="flex items-center gap-3 hover:opacity-80 transition">
                <Image
                  src="/fcs_logo.png"
                  alt="FCS Logo"
                  width={128}
                  height={128}
                  quality={100}
                  priority
                  className="h-10 w-10 object-contain"
                />
                <span className="text-xl font-bold text-[#010030]">FCS Registry</span>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">


              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#010030] text-white flex items-center justify-center font-bold text-sm select-none">
                    {user?.firstName?.[0] || "U"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserCircle className="w-4 h-4" />
                          Profile
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href="/settings"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 top-16 z-40">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Menu Content */}
            <div className="relative bg-white border-t border-gray-200 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-6 space-y-6">
                {navigationGroups.map((group) => (
                  <div key={group.label}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                      {group.label}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Mobile User Profile Section */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 px-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#010030] text-white flex items-center justify-center font-bold text-lg select-none">
                      {user?.firstName?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircle className="w-5 h-5" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>


    </>
  );
}

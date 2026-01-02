"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  BarChart3,
  Users,
  Calendar,
  CheckSquare,
  Building2,
  MapPin,
  UsersRound,
  Bell,
  Settings,
  Shield,
  Command,
  Route,
  FileText,
  ChevronRight,
  Home,
  Printer,
  Search,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Main", "Management", "Menu", "Registrar Portal"]);

  const isAdmin = user?.roles?.some((r: any) => {
    const role = r.toLowerCase();
    return role.includes('admin') || role === 'leader';
  });

  const isRegistrar = user?.roles?.some((r: any) => {
    const role = r.toLowerCase();
    return role === 'registrar';
  });

  const adminNavigationGroups: NavGroup[] = [
    {
      label: "Main",
      items: [
        { href: "/home", label: "Dashboard", icon: Home },
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
        { href: "/admin/users", label: "Manage Admins", icon: Shield },
        { href: "/admin/registrars", label: "Manage Registrars", icon: UsersRound },
        { href: "/groups", label: "Groups", icon: UsersRound },
        { href: "/attendance", label: "Attendance", icon: CheckSquare },
      ],
    },
    {
      label: "Analytics",
      items: [
        { href: "/reports", label: "Reports", icon: BarChart3 },
        { href: "/kiosk", label: "Kiosk Mode", icon: FileText },
      ],
    },
    {
      label: "System",
      items: [
        { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
        { href: "/settings", label: "Settings", icon: Settings },
        { href: "/admin", label: "Admin Panel", icon: Shield },
        { href: "/command", label: "Command Center", icon: Command },
        { href: "/routes", label: "Routes", icon: Route },
      ],
    },
  ];

  const registrarNavigationGroups: NavGroup[] = [
    {
      label: "Menu",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/profile", label: "My Profile", icon: UsersRound },
      ]
    },
    {
      label: "Registrar Portal",
      items: [
        { href: "/my-events", label: "My Registrations", icon: CheckSquare },
        { href: "/registration-tray", label: "Registration Tray", icon: FileText },
        { href: "/attendance", label: "Attendance", icon: Users },
        { href: "/print-tags", label: "Print Tags", icon: Printer },
        { href: "/extensive-search", label: "Extensive Search", icon: Search },
      ]
    }
  ];

  const memberNavigationGroups: NavGroup[] = [
    {
      label: "Menu",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/events", label: "Events", icon: Calendar },
        { href: "/profile", label: "My Profile", icon: UsersRound },
        { href: "/my-events", label: "My Registrations", icon: CheckSquare },
      ]
    }
  ];

  const navigationGroups = isAdmin
    ? adminNavigationGroups
    : isRegistrar
      ? registrarNavigationGroups
      : memberNavigationGroups;

  const isActive = (href: string) => pathname === href;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-6">
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.label);

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""
                      }`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Actions Footer - Admin Only */}
        {isAdmin && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </p>
            <div className="space-y-2">
              <Link
                href="/admin/users/new"
                className="block px-3 py-2 text-sm text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Make Admin
              </Link>
              <Link
                href="/events/new"
                className="block px-3 py-2 text-sm text-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                + New Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { EnhancedHeader } from "./enhanced-header";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // Define public routes where sidebar/header should be hidden
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/landing" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/register") ||
    pathname.includes("/login"); // Catch specific event login pages if any

  // If it's a public route, just render children
  if (isPublicRoute) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 lg:pl-64 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { ReactNode } from "react";
import { EnhancedHeader } from "./enhanced-header";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader />
      
      <div className="flex">
        {showSidebar && <Sidebar />}
        
        <main className={`flex-1 ${showSidebar ? "lg:pl-64" : ""} pt-16`}>
          {children}
        </main>
      </div>
    </div>
  );
}

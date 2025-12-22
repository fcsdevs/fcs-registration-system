"use client";

import React from "react";
import { AdminProvider, useAdmin } from "@/context/admin-context";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, LayoutDashboard, Calendar, Users, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <AdminShell>{children}</AdminShell>
        </AdminProvider>
    );
}

function AdminShell({ children }: { children: React.ReactNode }) {
    const { currentScope, isLoading } = useAdmin();
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-900">FCS Admin</h1>
                    {currentScope && (
                        <div className="mt-2 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded inline-block">
                            {currentScope.level.toUpperCase()} LEVEL
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link href="/admin/events" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                        <Calendar className="w-5 h-5 mr-3" />
                        Events
                    </Link>
                    <Link href="/admin/members" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                        <Users className="w-5 h-5 mr-3" />
                        Members
                    </Link>
                    <Link href="/admin/settings" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 md:px-8">
                    <div className="flex items-center">
                        {/* Mobile Menu Toggle could go here */}
                        <h2 className="text-lg font-semibold text-gray-800">
                            {currentScope ? `${currentScope.name}` : 'Admin Portal'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        {currentScope && (
                            <div className="hidden md:block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                Viewing as {currentScope.name}
                            </div>
                        )}
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

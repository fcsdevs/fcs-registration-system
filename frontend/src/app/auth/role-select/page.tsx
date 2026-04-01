"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Shield, User } from "lucide-react";

export default function RoleSelectPage() {
  const router = useRouter();
  const { user, actualIsAdmin, switchViewMode, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !actualIsAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, actualIsAdmin, router]);

  if (isLoading || !actualIsAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40">
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">How would you like to proceed?</h1>
          <p className="text-gray-600">Choose your workspace view for this session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => switchViewMode('admin')}
            className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin View</h2>
            <p className="text-gray-500 text-center">Manage members, events, attendance, and analytics.</p>
          </button>

          <button
            onClick={() => switchViewMode('member')}
            className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-emerald-500 hover:shadow-xl transition-all group"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Regular User View</h2>
            <p className="text-gray-500 text-center">View your tickets, register for events, and manage profile.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ProtectedRoute } from "@/components/common/route-guards";
import { Header } from "@/components/layout/header";
import { Shield, Users, FileText, Settings, Database, Activity } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const adminSections = [
    {
      title: "Roles & Permissions",
      description: "Manage user roles and access control",
      icon: Shield,
      href: "/admin/roles",
      color: "blue",
    },
    {
      title: "Audit Logs",
      description: "View system activity and changes",
      icon: FileText,
      href: "/admin/audit",
      color: "green",
    },
    {
      title: "User Management",
      description: "Manage system users and accounts",
      icon: Users,
      href: "/admin/users",
      color: "purple",
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      href: "/settings",
      color: "orange",
    },
    {
      title: "Database",
      description: "Database backup and maintenance",
      icon: Database,
      href: "/admin/database",
      color: "red",
    },
    {
      title: "System Health",
      description: "Monitor system performance",
      icon: Activity,
      href: "/admin/health",
      color: "teal",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System administration and management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => {
              const Icon = section.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600",
                red: "bg-red-100 text-red-600",
                teal: "bg-teal-100 text-teal-600",
              };

              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-600 text-sm">{section.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
